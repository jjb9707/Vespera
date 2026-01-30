//! Rental agreement error types.
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum RentalError {
    /// Agreement with this ID already exists
    AgreementAlreadyExists = 4,
    /// Invalid amount provided
    InvalidAmount = 5,
    /// Invalid date range
    InvalidDate = 6,
    /// Invalid agent commission rate
    InvalidCommissionRate = 7,
    /// Agreement is not active
    AgreementNotActive = 10,
    /// Agreement not found
    AgreementNotFound = 13,
    /// Caller is not the tenant
    NotTenant = 14,
    /// Agreement is in invalid state for this operation
    InvalidState = 15,
    /// Agreement has expired
    Expired = 16,
}
