/**
 * state.js — Shared application state to avoid circular dependencies
 */

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}
