use soroban_sdk::{contractevent, Address, Env, String};
use crate::Config;

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgreementCreatedEvent {
    pub agreement_id: String,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgreementSigned {
    pub agreement_id: String,
    pub landlord: Address,
    pub tenant: Address,
    pub signed_at: u64,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractInitialized {
    pub admin: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConfigUpdated {
    pub old_config: Config,
    pub new_config: Config,
}

pub(crate) fn contract_initialized(env: &Env, admin: Address) {
    ContractInitialized { admin }.publish(env);
}

pub(crate) fn config_updated(env: &Env, old_config: Config, new_config: Config) {
    ConfigUpdated {
        old_config,
        new_config,
    }
    .publish(env);
}
