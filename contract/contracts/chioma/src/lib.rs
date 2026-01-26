#![no_std]
#![allow(clippy::too_many_arguments)]

//! Chioma Rental Agreement Contract
//!
//! Manages rental agreements between landlords, tenants, and agents.
//! Handles agreement creation, signing, and status management.

use soroban_sdk::{contract, contractimpl, vec, Address, Env, String, Vec};

mod agreement;
mod errors;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod tests;

// Re-export public APIs
pub use agreement::{
    create_agreement, get_agreement, get_agreement_count, get_payment_split, has_agreement,
    sign_agreement, validate_agreement_params,
};
pub use errors::RentalError;
pub use events::{AgreementCreatedEvent, AgreementSigned};
pub use storage::DataKey;
pub use types::{AgreementStatus, Config, ContractState, PaymentSplit, RentAgreement};

#[contract]
pub struct Contract;

#[allow(clippy::too_many_arguments)]
#[contractimpl]
impl Contract {
    /// Simple hello function for testing
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }

    /// Initializes the contract with admin and configuration.
    /// Can only be called once.
    ///
    /// # Arguments
    /// * `admin` - Address that will have admin privileges
    /// * `config` - Initial configuration parameters
    ///
    /// # Errors
    /// * `AlreadyInitialized` - If contract is already initialized
    /// * `InvalidAdmin` - If admin address is invalid
    /// * `InvalidConfig` - If config parameters are invalid
    pub fn initialize(env: Env, admin: Address, config: Config) -> Result<(), RentalError> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::State) {
            return Err(RentalError::AlreadyInitialized);
        }

        // Validate admin address (require authentication)
        admin.require_auth();

        // Validate config parameters
        // Fee basis points must not exceed 10000 (100%)
        if config.fee_bps > 10_000 {
            return Err(RentalError::InvalidConfig);
        }

        // Fee collector must authenticate
        config.fee_collector.require_auth();

        // Create initial contract state
        let state = ContractState {
            admin: admin.clone(),
            config,
            initialized: true,
        };

        // Store state in instance storage (persists across contract upgrades)
        env.storage().instance().set(&DataKey::State, &state);
        env.storage().instance().extend_ttl(500000, 500000);

        // Emit initialization event
        events::contract_initialized(&env, admin);

        Ok(())
    }

    /// Retrieves the current contract state.
    /// Returns None if contract is not initialized.
    pub fn get_state(env: Env) -> Option<ContractState> {
        env.storage().instance().get(&DataKey::State)
    }

    /// Creates a new rent agreement and stores it on-chain.
    ///
    /// Authorization:
    /// - Tenant MUST authorize creation (prevents landlord-only spoofing)
    #[allow(clippy::too_many_arguments)]
    pub fn create_agreement(
        env: Env,
        agreement_id: String,
        landlord: Address,
        tenant: Address,
        agent: Option<Address>,
        monthly_rent: i128,
        security_deposit: i128,
        start_date: u64,
        end_date: u64,
        agent_commission_rate: u32,
        payment_token: Address,
    ) -> Result<(), RentalError> {
        agreement::create_agreement(
            &env,
            agreement_id,
            landlord,
            tenant,
            agent,
            monthly_rent,
            security_deposit,
            start_date,
            end_date,
            agent_commission_rate,
            payment_token,
        )
    }

    /// Allows a tenant to sign and accept a rental agreement.
    /// Transitions the agreement from Pending to Active state.
    ///
    /// Authorization:
    /// - Tenant MUST authorize the signing
    pub fn sign_agreement(
        env: Env,
        tenant: Address,
        agreement_id: String,
    ) -> Result<(), RentalError> {
        agreement::sign_agreement(&env, tenant, agreement_id)
    }

    /// Retrieves a rent agreement by its unique identifier.
    pub fn get_agreement(env: Env, agreement_id: String) -> Option<RentAgreement> {
        agreement::get_agreement(&env, agreement_id)
    }

    /// Checks whether a rent agreement exists for the given identifier.
    pub fn has_agreement(env: Env, agreement_id: String) -> bool {
        agreement::has_agreement(&env, agreement_id)
    }

    /// Returns the total number of rent agreements created.
    pub fn get_agreement_count(env: Env) -> u32 {
        agreement::get_agreement_count(&env)
    }

    /// Get payment details for a specific month
    pub fn get_payment_split(
        env: Env,
        agreement_id: String,
        month: u32,
    ) -> Result<PaymentSplit, RentalError> {
        agreement::get_payment_split(&env, agreement_id, month)
    }
}
