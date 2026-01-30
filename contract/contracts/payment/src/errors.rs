//! Custom error types for the Payment contract.
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PaymentError {
    /// Payment record not found
    PaymentNotFound = 11,
    /// Payment processing failed
    PaymentFailed = 12,
    /// Agreement not found
    AgreementNotFound = 13,
    /// Caller is not the tenant
    NotTenant = 14,
    /// Agreement is not active
    AgreementNotActive = 10,
    /// Invalid payment amount
    InvalidPaymentAmount = 17,
    /// Payment not yet due
    PaymentNotDue = 18,
    /// Invalid amount provided
    InvalidAmount = 5,
}
