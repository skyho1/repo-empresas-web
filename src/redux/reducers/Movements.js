import {
  ADD_INVOICE,
  GET_MOVEMENTS,
  RES_ADD_MOVEMENT,
  GET_INVENTORY_PRODUCTS,
  ADD_MOVEMENT,
  FETCH_SUCCESS,
  FETCH_ERROR,
  UPDATE_MOVEMENT,
  GENERATE_INVOICE,
  CANCEL_INVOICE,
  ADD_REFERRAL_GUIDE,
  ADD_CREDIT_NOTE,
  ADD_RECEIPT,
  GENERATE_ROUTE,
  LIST_ROUTE,
  GENERATE_DISTRIBUTION,
  LIST_DISTRIBUTION,
  TO_UPDATE_ITEM_IN_LIST_DISTRIBUTION,
  UPDATE_ROUTE,
  ROUTE_TO_REFERRAL_GUIDE,
  UPDATE_GENERATE_REFERRAL_GUIDE_VALUE,
  GET_CHILD_ROUTES,
  SET_DELIVERIES_SIMPLE,
} from '../../shared/constants/ActionTypes';

const INIT_STATE = {
  list: [],
  getMovementsRes: [],
};

const movementsReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_MOVEMENTS:
      console.log('data de reducer GET_MOVEMENTS', action.payload);
      return {
        ...state,
        getMovementsRes: action.payload,
      };
    case GET_INVENTORY_PRODUCTS:
      console.log('data de reducer GET_INVENTORY_PRODUCTS', action.payload);
      return {
        ...state,
        getInventoryProductsRes: action.payload,
      };
    case ADD_MOVEMENT:
      console.log('data de reducer ADD_MOVEMENT', action.payload);
      return {
        ...state,
        addMovementRes: action.payload,
      };
    case RES_ADD_MOVEMENT:
      console.log('data de reducer RES_ADD_MOVEMENT', action.payload);
      return {
        ...state,
        newMovementRes: action.payload,
      };
    case UPDATE_MOVEMENT:
      console.log('data de reducer UPDATE_MOVEMENT', action.payload);
      return {
        ...state,
        updateMovementRes: action.payload,
      };
    case GENERATE_INVOICE:
      console.log('data de reducer GENERATE_INVOICE', action.payload);
      return {
        ...state,
        generateInvoiceRes: action.payload,
      };
    case ADD_INVOICE:
      console.log('data de reducer ADD_INVOICE', action.payload);
      return {
        ...state,
        addInvoiceRes: action.payload,
      };
    case CANCEL_INVOICE:
      console.log('data de reducer CANCEL_INVOICE', action.payload);
      return {
        ...state,
        cancelInvoiceRes: action.payload,
      };
    case ADD_REFERRAL_GUIDE:
      console.log('data de reducer ADD_REFERRAL_GUIDE', action.payload);
      return {
        ...state,
        addReferralGuideRes: action.payload,
      };
    case ADD_CREDIT_NOTE:
      console.log('data de reducer ADD_CREDIT_NOTE', action.payload);
      return {
        ...state,
        addCreditNoteRes: action.payload,
      };
    case ADD_RECEIPT:
      console.log('data de reducer ADD_RECEIPT', action.payload);
      return {
        ...state,
        addReceiptRes: action.payload,
      };
    case GENERATE_ROUTE:
      console.log('data de reducer GENERATE_ROUTE', action.payload);
      return {
        ...state,
        generateRouteRes: action.payload,
      };
    case UPDATE_ROUTE:
      console.log('data de reducer UPDATE_ROUTE', action.payload);
      return {
        ...state,
        updateRouteRes: action.payload,
      };
    case LIST_ROUTE:
      console.log('data de reducer LIST_ROUTE', action.payload);

      let newListRoute =
        action.payload && action.payload.Items ? action.payload.Items : [];
      if (action.request && action.request.request.payload.LastEvaluatedKey) {
        newListRoute = [...state.listRoute, ...newListRoute];
      }
      return {
        ...state,
        listRoute: newListRoute,
        LastEvaluatedKey:
          action.payload && action.payload.LastEvaluatedKey
            ? action.payload.LastEvaluatedKey
            : null,
      };

    case SET_DELIVERIES_SIMPLE:
      console.log('data de reducer SET_DELIVERIES_SIMPLE', action.payload);

      return {
        ...state,
        deliveries: action.payload,
      };

    case GET_CHILD_ROUTES:
      console.log('data de reducer GET_CHILD_ROUTES1234', action.payload);

      let deliveries = [];

      if (
        action.payload &&
        action.payload.Items &&
        action.payload.Items.length > 0
      ) {
        for (var i = 0; i < action.payload.Items.length; i++) {
          console.log('El i', i);
          console.log('action.payload123', action.payload);
          deliveries = [
            ...deliveries,
            ...action.payload.Items[i].deliveries,
          ];
        }
      }

      return {
        ...state,
        deliveries,
        // childRoutes: (action.payload && action.payload.Items) ? action.payload.Items : [],
        // LastEvaluatedKeyChildRoute:
        //   action.payload && action.payload.LastEvaluatedKey
        //     ? action.payload.LastEvaluatedKey
        //     : null,
      };

    case LIST_DISTRIBUTION:
      console.log('data de reducer LIST_DISTRIBUTION', action.payload);
      return {
        ...state,
        listDistribution: action.payload,
      };

    case TO_UPDATE_ITEM_IN_LIST_DISTRIBUTION:
      console.log('data de reducer TO_UPDATE_ITEM_IN_LIST_DISTRIBUTION', action.payload);
      let indexDistribution =  action.indexDistributionSelected
      console.log("indexDistribution ahora si papu", indexDistribution)
      console.log("action.payload", action.payload)
      
      let newListDistributions = state.listDistribution
      newListDistributions[indexDistribution].deliveries = action.payload.deliveries
      // listDistribution[i].deliveries= 
      return {
        ...state,
        listDistribution: newListDistributions
      };

    case GENERATE_DISTRIBUTION:
      console.log('data de reducer GENERATE_DISTRIBUTION', action.payload);
      return {
        ...state,
        generateDistributionRes: action.payload,
      };
    case FETCH_SUCCESS:
      console.log('data de reducer FETCH_SUCCESS', action.payload);
      return {
        ...state,
        successMessage: action.payload,
      };
    case FETCH_ERROR:
      console.log('data de reducer FETCH_ERROR', action.payload);
      return {
        ...state,
        errorMessage: action.payload,
      };
    case ROUTE_TO_REFERRAL_GUIDE:
      console.log('data de reducer ROUTE_TO_REFERRAL_GUIDE', action.payload);
      return {
        ...state,
        routeToReferralGuide: action.payload,
      };
    case UPDATE_GENERATE_REFERRAL_GUIDE_VALUE:
      console.log(
        'data de reducer UPDATE_GENERATE_REFERRAL_GUIDE_VALUE',
        action.payload,
      );
      return {
        ...state,
        updateGenerateReferralGuideRes: action.payload,
      };
    default:
      return state;
  }
};

export default movementsReducer;
