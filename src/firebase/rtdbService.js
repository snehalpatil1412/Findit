import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push
} from 'firebase/database';
import { rtdb, isLiveFirebase } from './config';
import { SEED_ITEMS, ITEM_STATUSES, CLAIM_STATUSES } from '../utils/constants';
import { sendClaimAcceptedEmail } from '../utils/emailService';

// Local storage keys for fallback operation
const STORAGE_ITEMS_KEY = 'findit_db_items';
const STORAGE_CLAIMS_KEY = 'findit_db_claims';
const STORAGE_HISTORY_KEY = 'findit_db_user_history';

/**
 * Initialize Storage with Seed Data if empty
 */
function initDemoStorage() {
  try {
    if (!localStorage.getItem(STORAGE_ITEMS_KEY)) {
      const itemsMap = {};
      SEED_ITEMS.forEach(item => {
        itemsMap[item.id] = item;
      });
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(itemsMap));
    }
    if (!localStorage.getItem(STORAGE_CLAIMS_KEY)) {
      localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_HISTORY_KEY)) {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify({}));
    }
  } catch (e) {
    console.warn('Storage init error:', e);
  }
}

initDemoStorage();

// Custom event dispatcher for reactive local updates
function notifyLocalUpdate(eventName) {
  window.dispatchEvent(new CustomEvent(eventName));
}

// ----------------------------------------------------
// ITEM OPERATIONS
// ----------------------------------------------------

/**
 * Report a new Lost or Found item.
 */
export async function createItem(itemData) {
  const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const itemRecord = {
    id: itemId,
    type: itemData.type, // 'lost' | 'found'
    title: itemData.title,
    category: itemData.category,
    location: itemData.location || '',
    date: itemData.date,
    description: itemData.description,
    secretVerificationQuestion: itemData.secretVerificationQuestion || '',
    imageBase64: itemData.imageBase64 || '',
    hasImage: Boolean(itemData.imageBase64),
    reporterId: itemData.reporterId,
    reporterName: itemData.reporterName,
    reporterEmail: itemData.reporterEmail,
    status: ITEM_STATUSES.ACTIVE,
    activeClaimId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  if (isLiveFirebase && rtdb) {
    try {
      const itemRef = ref(rtdb, `items/${itemId}`);
      await set(itemRef, itemRecord);
      return itemRecord;
    } catch (err) {
      console.warn('Firebase RTDB write error, saving locally:', err);
    }
  }

  // Fallback / Local storage
  const raw = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
  const items = JSON.parse(raw);
  items[itemId] = itemRecord;
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
  notifyLocalUpdate('findit_items_updated');
  return itemRecord;
}

/**
 * Subscribes to all items in real time.
 */
export function subscribeToItems(callback) {
  if (isLiveFirebase && rtdb) {
    try {
      const itemsRef = ref(rtdb, 'items');
      return onValue(itemsRef, (snapshot) => {
        const val = snapshot.val() || {};
        const list = Object.values(val).sort((a, b) => b.createdAt - a.createdAt);
        callback(list);
      }, (error) => {
        console.warn('Firebase RTDB read error, falling back to local store:', error);
        emitLocalItems(callback);
      });
    } catch (e) {
      console.warn('Error subscribing to RTDB items:', e);
    }
  }

  return emitLocalItems(callback);
}

function emitLocalItems(callback) {
  const emit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
      const parsed = JSON.parse(raw);
      const list = Object.values(parsed).sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    } catch (e) {
      callback([]);
    }
  };

  emit();
  window.addEventListener('findit_items_updated', emit);
  window.addEventListener('storage', emit);

  return () => {
    window.removeEventListener('findit_items_updated', emit);
    window.removeEventListener('storage', emit);
  };
}

/**
 * Deletes or cancels a reported item.
 */
export async function deleteItem(itemId) {
  if (isLiveFirebase && rtdb) {
    try {
      await remove(ref(rtdb, `items/${itemId}`));
    } catch (e) {
      console.warn('Firebase RTDB delete error:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
  const items = JSON.parse(raw);
  delete items[itemId];
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
  notifyLocalUpdate('findit_items_updated');
}

/**
 * Manually marks a reported item (e.g. Lost report) as Returned / Recovered.
 * Completely removes it from Active Listings.
 */
export async function markItemAsReturned(itemId) {
  const updates = {
    status: ITEM_STATUSES.RETURNED,
    completedAt: Date.now()
  };

  if (isLiveFirebase && rtdb) {
    try {
      await update(ref(rtdb, `items/${itemId}`), updates);
    } catch (e) {
      console.warn('Firebase update error:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
  const items = JSON.parse(raw);
  if (items[itemId]) {
    items[itemId] = { ...items[itemId], ...updates };
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    notifyLocalUpdate('findit_items_updated');
  }
}

// ----------------------------------------------------
// CLAIM OPERATIONS
// ----------------------------------------------------

/**
 * Submits an ownership claim for a found item.
 */
export async function submitClaim(claimData) {
  const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const claimRecord = {
    id: claimId,
    itemId: claimData.itemId,
    itemTitle: claimData.itemTitle,
    itemType: claimData.itemType || 'found',
    itemCategory: claimData.itemCategory || 'General',
    itemLocation: claimData.itemLocation || '',
    ownerId: claimData.ownerId,
    ownerName: claimData.ownerName,
    ownerEmail: claimData.ownerEmail,
    claimantId: claimData.claimantId,
    claimantName: claimData.claimantName,
    claimantEmail: claimData.claimantEmail,
    claimantPhone: claimData.claimantPhone || '',
    proofDescription: claimData.proofDescription,
    secretAnswer: claimData.secretAnswer || '',
    proofImageBase64: claimData.proofImageBase64 || '',
    status: CLAIM_STATUSES.PENDING,
    rejectionReason: '',
    handoverStatus: {
      ownerSubmitted: false,
      ownerSubmittedAt: null,
      claimantReceived: false,
      claimantReceivedAt: null
    },
    createdAt: Date.now()
  };

  if (isLiveFirebase && rtdb) {
    try {
      await set(ref(rtdb, `claims/${claimId}`), claimRecord);
      return claimRecord;
    } catch (err) {
      console.warn('Firebase RTDB claim write error:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_CLAIMS_KEY) || '{}';
  const claims = JSON.parse(raw);
  claims[claimId] = claimRecord;
  localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
  notifyLocalUpdate('findit_claims_updated');
  return claimRecord;
}

/**
 * Subscribes to claims in real time.
 */
export function subscribeToClaims(callback) {
  if (isLiveFirebase && rtdb) {
    try {
      const claimsRef = ref(rtdb, 'claims');
      return onValue(claimsRef, (snapshot) => {
        const val = snapshot.val() || {};
        const list = Object.values(val).sort((a, b) => b.createdAt - a.createdAt);
        callback(list);
      }, (error) => {
        console.warn('Firebase RTDB read claims error:', error);
        emitLocalClaims(callback);
      });
    } catch (e) {
      console.warn('Error subscribing to claims:', e);
    }
  }

  return emitLocalClaims(callback);
}

function emitLocalClaims(callback) {
  const emit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_CLAIMS_KEY) || '{}';
      const parsed = JSON.parse(raw);
      const list = Object.values(parsed).sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    } catch (e) {
      callback([]);
    }
  };

  emit();
  window.addEventListener('findit_claims_updated', emit);
  window.addEventListener('storage', emit);

  return () => {
    window.removeEventListener('findit_claims_updated', emit);
    window.removeEventListener('storage', emit);
  };
}

/**
 * Reviews a claim (Approves or Rejects).
 */
export async function reviewClaim(claim, newStatus, reason = '', returnInstructions = '') {
  const isApproved = newStatus === CLAIM_STATUSES.APPROVED;
  const updates = {
    status: newStatus,
    rejectionReason: reason || '',
    reviewedAt: Date.now()
  };

  // If approved, trigger email coordination
  if (isApproved) {
    sendClaimAcceptedEmail({
      itemTitle: claim.itemTitle,
      ownerName: claim.ownerName,
      ownerEmail: claim.ownerEmail,
      claimantName: claim.claimantName,
      claimantEmail: claim.claimantEmail,
      location: claim.itemLocation,
      instructions: returnInstructions || `Please meet at ${claim.itemLocation || 'the public information counter'} to complete the handover.`
    });
  }

  if (isLiveFirebase && rtdb) {
    try {
      await update(ref(rtdb, `claims/${claim.id}`), updates);
      if (isApproved) {
        await update(ref(rtdb, `items/${claim.itemId}`), {
          status: ITEM_STATUSES.IN_HANDOVER,
          activeClaimId: claim.id
        });
      }
    } catch (e) {
      console.warn('Firebase review claim error:', e);
    }
  }

  // Local storage update
  const rawClaims = localStorage.getItem(STORAGE_CLAIMS_KEY) || '{}';
  const claims = JSON.parse(rawClaims);
  if (claims[claim.id]) {
    claims[claim.id] = { ...claims[claim.id], ...updates };
    localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
  }

  if (isApproved) {
    const rawItems = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
    const items = JSON.parse(rawItems);
    if (items[claim.itemId]) {
      items[claim.itemId].status = ITEM_STATUSES.IN_HANDOVER;
      items[claim.itemId].activeClaimId = claim.id;
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
      notifyLocalUpdate('findit_items_updated');
    }
  }

  notifyLocalUpdate('findit_claims_updated');
}

// ----------------------------------------------------
// DUAL-CONFIRMATION HANDOVER & AUTO-ARCHIVE
// ----------------------------------------------------

/**
 * Updates handover confirmation from either the owner or claimant.
 * When BOTH confirm:
 * 1. Sets item status to 'returned' (removes from active listings)
 * 2. Marks claim status as 'completed'
 * 3. Archives records in user_history for BOTH the owner and claimant
 * 4. Checks if the claimant had an active matching 'Lost' report and automatically marks it as returned too!
 */
export async function updateHandoverConfirmation(claim, role, isConfirmed) {
  const currentHandover = claim.handoverStatus || {
    ownerSubmitted: false,
    claimantReceived: false
  };

  const updatedHandover = {
    ...currentHandover,
    ...(role === 'owner'
      ? { ownerSubmitted: isConfirmed, ownerSubmittedAt: isConfirmed ? Date.now() : null }
      : { claimantReceived: isConfirmed, claimantReceivedAt: isConfirmed ? Date.now() : null })
  };

  const isBothCompleted = updatedHandover.ownerSubmitted && updatedHandover.claimantReceived;

  const claimUpdates = {
    handoverStatus: updatedHandover,
    ...(isBothCompleted ? { status: CLAIM_STATUSES.COMPLETED, completedAt: Date.now() } : {})
  };

  const completedTimestamp = Date.now();
  const ownerHistoryRecord = {
    id: `hist_${claim.id}_owner`,
    itemId: claim.itemId,
    claimId: claim.id,
    itemTitle: claim.itemTitle,
    itemCategory: claim.itemCategory,
    location: claim.itemLocation,
    myRole: 'Item Finder / Submitter',
    counterpartyName: claim.claimantName,
    counterpartyEmail: claim.claimantEmail,
    completedAt: completedTimestamp,
    isDeletedByUser: false
  };

  const claimantHistoryRecord = {
    id: `hist_${claim.id}_claimant`,
    itemId: claim.itemId,
    claimId: claim.id,
    itemTitle: claim.itemTitle,
    itemCategory: claim.itemCategory,
    location: claim.itemLocation,
    myRole: 'Item Owner / Receiver',
    counterpartyName: claim.ownerName,
    counterpartyEmail: claim.ownerEmail,
    completedAt: completedTimestamp,
    isDeletedByUser: false
  };

  if (isLiveFirebase && rtdb) {
    try {
      await update(ref(rtdb, `claims/${claim.id}`), claimUpdates);

      if (isBothCompleted) {
        // 1. Mark claimed item as returned
        await update(ref(rtdb, `items/${claim.itemId}`), {
          status: ITEM_STATUSES.RETURNED,
          completedAt: completedTimestamp
        });

        // 2. Also check if claimant had reported a matching Lost item and mark it as returned
        const itemsSnapshot = await get(ref(rtdb, 'items'));
        if (itemsSnapshot.exists()) {
          const allItems = itemsSnapshot.val();
          for (const key in allItems) {
            const itm = allItems[key];
            if (
              itm.reporterId === claim.claimantId &&
              itm.type === 'lost' &&
              itm.status !== ITEM_STATUSES.RETURNED &&
              (itm.category === claim.itemCategory || itm.title.toLowerCase().includes(claim.itemTitle.toLowerCase().split(' ')[0]))
            ) {
              await update(ref(rtdb, `items/${itm.id}`), {
                status: ITEM_STATUSES.RETURNED,
                completedAt: completedTimestamp
              });
            }
          }
        }

        // 3. Write user histories
        await set(ref(rtdb, `user_history/${claim.ownerId}/${ownerHistoryRecord.id}`), ownerHistoryRecord);
        await set(ref(rtdb, `user_history/${claim.claimantId}/${claimantHistoryRecord.id}`), claimantHistoryRecord);
      }
    } catch (e) {
      console.warn('Firebase RTDB handover update error:', e);
    }
  }

  // Local storage update
  const rawClaims = localStorage.getItem(STORAGE_CLAIMS_KEY) || '{}';
  const claims = JSON.parse(rawClaims);
  if (claims[claim.id]) {
    claims[claim.id] = { ...claims[claim.id], ...claimUpdates };
    localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
  }

  if (isBothCompleted) {
    const rawItems = localStorage.getItem(STORAGE_ITEMS_KEY) || '{}';
    const items = JSON.parse(rawItems);

    // Mark the claimed item as returned
    if (items[claim.itemId]) {
      items[claim.itemId].status = ITEM_STATUSES.RETURNED;
      items[claim.itemId].completedAt = completedTimestamp;
    }

    // Also find any matching lost report by the claimant and mark it returned
    for (const key in items) {
      const itm = items[key];
      if (
        itm.reporterId === claim.claimantId &&
        itm.type === 'lost' &&
        itm.status !== ITEM_STATUSES.RETURNED
      ) {
        // If category matches or title overlaps, mark resolved
        if (
          itm.category === claim.itemCategory ||
          itm.title.toLowerCase().includes(claim.itemTitle.toLowerCase().split(' ')[0])
        ) {
          itm.status = ITEM_STATUSES.RETURNED;
          itm.completedAt = completedTimestamp;
        }
      }
    }

    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));

    // Save to user history
    const rawHist = localStorage.getItem(STORAGE_HISTORY_KEY) || '{}';
    const histories = JSON.parse(rawHist);

    if (!histories[claim.ownerId]) histories[claim.ownerId] = {};
    if (!histories[claim.claimantId]) histories[claim.claimantId] = {};

    histories[claim.ownerId][ownerHistoryRecord.id] = ownerHistoryRecord;
    histories[claim.claimantId][claimantHistoryRecord.id] = claimantHistoryRecord;

    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(histories));

    notifyLocalUpdate('findit_history_updated');
    notifyLocalUpdate('findit_items_updated');
  }

  notifyLocalUpdate('findit_claims_updated');
  return { isBothCompleted };
}

// ----------------------------------------------------
// TRANSACTION HISTORY OPERATIONS
// ----------------------------------------------------

/**
 * Subscribes to personal transaction history for a specific user.
 */
export function subscribeToUserHistory(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (isLiveFirebase && rtdb) {
    try {
      const histRef = ref(rtdb, `user_history/${userId}`);
      return onValue(histRef, (snapshot) => {
        const val = snapshot.val() || {};
        const list = Object.values(val)
          .filter(item => !item.isDeletedByUser)
          .sort((a, b) => b.completedAt - a.completedAt);
        callback(list);
      }, (error) => {
        console.warn('Firebase RTDB history error:', error);
        emitLocalHistory(userId, callback);
      });
    } catch (e) {
      console.warn('Error subscribing to history:', e);
    }
  }

  return emitLocalHistory(userId, callback);
}

function emitLocalHistory(userId, callback) {
  const emit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY) || '{}';
      const parsed = JSON.parse(raw);
      const userRecords = parsed[userId] || {};
      const list = Object.values(userRecords)
        .filter(item => !item.isDeletedByUser)
        .sort((a, b) => b.completedAt - a.completedAt);
      callback(list);
    } catch (e) {
      callback([]);
    }
  };

  emit();
  window.addEventListener('findit_history_updated', emit);
  window.addEventListener('storage', emit);

  return () => {
    window.removeEventListener('findit_history_updated', emit);
    window.removeEventListener('storage', emit);
  };
}

/**
 * Deletes a historical record strictly from the calling user's history view.
 */
export async function deleteUserHistoryEntry(userId, historyEntryId) {
  if (isLiveFirebase && rtdb) {
    try {
      await update(ref(rtdb, `user_history/${userId}/${historyEntryId}`), {
        isDeletedByUser: true
      });
    } catch (e) {
      console.warn('Firebase history delete error:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_HISTORY_KEY) || '{}';
  const histories = JSON.parse(raw);
  if (histories[userId] && histories[userId][historyEntryId]) {
    histories[userId][historyEntryId].isDeletedByUser = true;
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(histories));
    notifyLocalUpdate('findit_history_updated');
  }
}

/**
 * Resets database back to default seed items.
 */
export function resetDemoDatabase() {
  localStorage.removeItem(STORAGE_ITEMS_KEY);
  localStorage.removeItem(STORAGE_CLAIMS_KEY);
  localStorage.removeItem(STORAGE_HISTORY_KEY);
  initDemoStorage();
  notifyLocalUpdate('findit_items_updated');
  notifyLocalUpdate('findit_claims_updated');
  notifyLocalUpdate('findit_history_updated');
}
