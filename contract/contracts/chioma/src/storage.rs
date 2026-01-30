//! Storage key definitions for the Chioma/Rental contract.
use soroban_sdk::{contracttype, String};

/// Storage key variants for persistent storage.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// Store agreement by ID
    Agreement(String),
    /// Counter for total agreements
    AgreementCount,
}
