import { CustomerActionTypes } from "../actionTypes";
import _ from "lodash";

const initialState = {
  customers: [],
  customerCount: 0,
  selectedCustomer: null,
  subscriptionsInUse: [],
  licencesUnAssigned: [],
  lookupLicences: {
    licences: [],
    types: []
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_CUSTOMERS: {
      return {
        ...state,
        customers: action.data.data,
        customerCount: action.data.customerCount
      };
    }
    case CustomerActionTypes.ADD_CUSTOMER: {
      return {
        ...state,
        customers: state.customers.push(action.data.data.customer),
        selectedCustomer: action.data.data.customer
      };
    }
    case CustomerActionTypes.SET_SELECTED_CUSTOMER: {
      return {
        ...state,
        selectedCustomer: action.customer
      };
    }
    case CustomerActionTypes.SUBSCRIPTIONS_IN_USE: {
      return {
        ...state,
        subscriptionsInUse: action.data.data
      };
    }
    case CustomerActionTypes.LICENCES_UN_ASSIGNED: {
      return {
        ...state,
        licencesUnAssigned: action.data
      };
    }
    case CustomerActionTypes.RESET_IN_USE_UN_ASSIGNED: {
      return {
        ...state,
        subscriptionsInUse: [],
        licencesUnAssigned: []
      };
    }
    case CustomerActionTypes.GET_LICENCE_LOOKUPS: {
      return {
        ...state,
        lookupLicences: {
          licences: _.map(
            action.data.subscription_licences || action.data.licences,
            licence => ({
              key: licence.id,
              value: licence.name,
              ...licence
            })
          ),
          types: _.map(
            action.data.subscription_types || action.data.types,
            type => ({
              key: type.id,
              value: type.name,
              ...type
            })
          )
        }
      };
    }
    default:
      return state;
  }
};
