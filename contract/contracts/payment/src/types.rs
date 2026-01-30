//! Data structures for the Payment contract.
use soroban_sdk::{contracttype, Address, Map, String};

/// Payment record for tracking individual payments
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub agreement_id: String,
    pub payment_number: u32,
    pub amount: i128,
    pub landlord_amount: i128,
    pub agent_amount: i128,
    pub timestamp: u64,
    pub tenant: Address,
}

/// Payment split information for rent payments
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentSplit {
    pub landlord_amount: i128,
    pub platform_amount: i128,
    pub token: Address,
    pub payment_date: u64,
}

/// Agreement status enum (needed for payment validation)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AgreementStatus {
    Draft,
    Pending,
    Active,
    Completed,
    Cancelled,
    Terminated,
    Disputed,
}

/// Rent agreement structure (needed for payment processing)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RentAgreement {
    pub agreement_id: String,
    pub landlord: Address,
    pub tenant: Address,
    pub agent: Option<Address>,
    pub monthly_rent: i128,
    pub security_deposit: i128,
    pub start_date: u64,
    pub end_date: u64,
    pub agent_commission_rate: u32,
    pub status: AgreementStatus,
    pub total_rent_paid: i128,
    pub payment_count: u32,
    pub signed_at: Option<u64>,
    pub payment_token: Address,
    pub next_payment_due: u64,
    pub payment_history: Map<u32, PaymentSplit>,
}
