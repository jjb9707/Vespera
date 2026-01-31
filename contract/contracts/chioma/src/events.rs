//! Contract events for the Chioma/Rental contract.
use soroban_sdk::{contractevent, Address, Env, String};

// ... existing events ...

/// Event emitted when a new agreement is created
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgreementCreatedEvent {
    pub agreement_id: String,
}

/// Event emitted when an agreement is signed by the tenant
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgreementSigned {
    pub agreement_id: String,
    pub landlord: Address,
    pub tenant: Address,
    pub signed_at: u64,
}

/// Event emitted when contract is initialized
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractInitialized {
    pub admin: Address,
}

/// Emitted when contract is initialized
pub(crate) fn contract_initialized(env: &Env, admin: Address) {
    ContractInitialized { admin }.publish(env);
}
