//! Access control and role-based authorization for the Escrow contract.
//! Validates that callers have the proper role to perform actions.
#[allow(unused_imports)]
use soroban_sdk::{Address, Env};

use crate::errors::EscrowError;
use crate::types::Escrow;

/// Access control validation functions.
pub struct AccessControl;

impl AccessControl {
    /// Verify caller is the depositor (tenant).
    pub fn is_depositor(escrow: &Escrow, caller: &Address) -> Result<(), EscrowError> {
        if escrow.depositor == *caller {
            Ok(())
        } else {
            Err(EscrowError::NotAuthorized)
        }
    }

    /// Verify caller is the beneficiary (landlord).
    pub fn is_beneficiary(escrow: &Escrow, caller: &Address) -> Result<(), EscrowError> {
        if escrow.beneficiary == *caller {
            Ok(())
        } else {
            Err(EscrowError::NotAuthorized)
        }
    }

    /// Verify caller is the arbiter (admin).
    pub fn is_arbiter(escrow: &Escrow, caller: &Address) -> Result<(), EscrowError> {
        if escrow.arbiter == *caller {
            Ok(())
        } else {
            Err(EscrowError::NotAuthorized)
        }
    }

    /// Verify caller is any of the three parties (depositor, beneficiary, or arbiter).
    pub fn is_party(escrow: &Escrow, caller: &Address) -> Result<(), EscrowError> {
        if escrow.depositor == *caller || escrow.beneficiary == *caller || escrow.arbiter == *caller
        {
            Ok(())
        } else {
            Err(EscrowError::InvalidSigner)
        }
    }

    /// Verify caller is either depositor or beneficiary (the two primary parties).
    /// Used for dispute initiation.
    pub fn is_primary_party(escrow: &Escrow, caller: &Address) -> Result<(), EscrowError> {
        if escrow.depositor == *caller || escrow.beneficiary == *caller {
            Ok(())
        } else {
            Err(EscrowError::NotAuthorized)
        }
    }
}
