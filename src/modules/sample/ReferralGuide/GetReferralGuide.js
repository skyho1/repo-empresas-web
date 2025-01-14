import React, {useEffect, useRef} from 'react';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import originalUbigeos from '../../../Utils/ubigeo.json';

import {
  ButtonGroup,
  Card,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Collapse,
  Alert,
} from '@mui/material';
import Router, {useRouter} from 'next/router';

import IntlMessages from '../../../@crema/utility/IntlMessages';
import AppTextField from '../../../@crema/core/AppFormComponents/AppTextField';
import {useDispatch, useSelector} from 'react-redux';
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import {DesktopDatePicker, DateTimePicker} from '@mui/lab';
import {
  parseToGoodDate,
  isObjEmpty,
  convertToDateWithoutTime,
  specialFormatToSunat,
  dateWithHyphen,
  strDateToDateObject,
} from '../../../Utils/utils';
import SelectedProducts from './SelectedProducts';
import SelectCarrier from './SelectCarrier';
import {getCarriers} from '../../../redux/actions/Carriers';
import {getUbigeos} from '../../../redux/actions/General';
import {
  getMovements,
  updateReferralGuideValue,
  addReferrealGuide,
} from '../../../redux/actions/Movements';
import {onGetBusinessParameter} from '../../../redux/actions/General';
import {red} from '@mui/material/colors';
import {orange} from '@mui/material/colors';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
  FETCH_SUCCESS,
  FETCH_ERROR,
  ADD_REFERRAL_GUIDE,
  GET_MOVEMENTS,
  GET_BUSINESS_PARAMETER,
  ROUTE_TO_REFERRAL_GUIDE,
  UPDATE_GENERATE_REFERRAL_GUIDE_VALUE,
} from '../../../shared/constants/ActionTypes';
import AddProductForm from './AddProductForm';

const validationSchema = yup.object({
  startingPoint: yup
    .string()
    .typeError(<IntlMessages id='validation.string' />)
    .required(<IntlMessages id='validation.required' />),
  arrivalPoint: yup
    .string()
    .required(<IntlMessages id='validation.required' />)
    .typeError(<IntlMessages id='validation.string' />),
  licensePlate: yup
    .string()
    .required(<IntlMessages id='validation.required' />)
    .typeError(<IntlMessages id='validation.string' />),
  driverName: yup
    .string()
    .required(<IntlMessages id='validation.required' />)
    .typeError(<IntlMessages id='validation.string' />),
  driverLastName: yup
    .string()
    .required(<IntlMessages id='validation.required' />)
    .typeError(<IntlMessages id='validation.string' />),
  totalWeight: yup
    .number()
    .typeError(<IntlMessages id='validation.number' />)
    .required(<IntlMessages id='validation.required' />)
    .test(
      'maxDigitsAfterDecimal',
      'El número puede contener como máximo 3 decimales',
      (number) => /^\d+(\.\d{1,3})?$/.test(number),
    ),
  numberPackages: yup
    .number()
    .typeError(<IntlMessages id='validation.number' />)
    .required(<IntlMessages id='validation.required' />)
    .integer(<IntlMessages id='validation.number.integer' />),
  driverLicenseNumber: yup
    .string()
    .required(<IntlMessages id='validation.required' />)
    .typeError(<IntlMessages id='validation.string' />),
  driverDocumentNumber: yup
    .number()
    .typeError(<IntlMessages id='validation.number' />)
    .required(<IntlMessages id='validation.required' />)
    .integer(<IntlMessages id='validation.number.integer' />),
  observation: yup.string().typeError(<IntlMessages id='validation.string' />),
  clientEmail: yup
    .string()
    .email(<IntlMessages id='validation.emailFormat' />)
    .required(<IntlMessages id='validation.required' />),
});

const objectsAreEqual = (a, b) => {
  // Comprobar si los dos valores son objetos
  if (typeof a === 'object' && typeof b === 'object') {
    // Comprobar si los objetos tienen las mismas propiedades
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    // Comparar el valor de cada propiedad de forma recursiva
    for (const key of aKeys) {
      if (!objectsAreEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  // Comparar los valores directamente
  return a === b;
};

const useForceUpdate = () => {
  const [reload, setReload] = React.useState(0); // integer state
  return () => setReload((value) => value + 1); // update the state to force render
};
let parsedUbigeos = [];

const GetReferralGuide = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {query} = router;
  console.log('query', query);
  const forceUpdate = useForceUpdate();
  const [issueDate, setIssueDate] = React.useState(Date.now());
  const [dateStartTransfer, setDateStartTransfer] = React.useState(Date.now());
  const [selectedProducts, setSelectedProducts] = React.useState([]);
  const [selectedOutput, setSelectedOutput] = React.useState({});
  const [totalWeight, setTotalWeight] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [typeDialog, setTypeDialog] = React.useState('');
  const [transportModeVal, setTransportModeVal] = React.useState(
    'privateTransportation',
  );
  const [reasonVal, setReasonVal] = React.useState('sale');
  const [sendClient, setSendClient] = React.useState(false);
  const [sendSunat, setSendSunat] = React.useState(false);
  const [driverDocumentType, setDriverDocumentType] = React.useState('DNI');
  const [ubigeoStartingPoint, setUbigeoStartingPoint] = React.useState(0);
  const [existStartingUbigeo, setExistStartingUbigeo] = React.useState(true);
  const [selectedStartingUbigeo, setSelectedStartingUbigeo] = React.useState(
    {},
  );
  const [ubigeoArrivalPoint, setUbigeoArrivalPoint] = React.useState(0);
  const [existArrivalUbigeo, setExistArrivalUbigeo] = React.useState(true);
  const [selectedArrivalUbigeo, setSelectedArrivalUbigeo] = React.useState({});
  const [selectedCarrier, setSelectedCarrier] = React.useState({});
  const [existCarrier, setExistCarrier] = React.useState(false);
  const [showForms, setShowForms] = React.useState(false);
  const [openAddProduct, setOpenAddProduct] = React.useState(false);
  const [serial, setSerial] = React.useState('');
  const [changeGenerateRG, setChangeGenerateRG] = React.useState(false);
  const [dataFinal, setDataFinal] = React.useState({});
  const [minTutorial, setMinTutorial] = React.useState(false);
  let changeValueField;

  const {userAttributes} = useSelector(({user}) => user);
  const {userDataRes} = useSelector(({user}) => user);
  const {addReferralGuideRes} = useSelector(({movements}) => movements);
  console.log('addReferralGuideRes', addReferralGuideRes);
  const {getMovementsRes} = useSelector(({movements}) => movements);
  console.log('getMovementsRes', getMovementsRes);
  const {businessParameter} = useSelector(({general}) => general);
  console.log('businessParameter', businessParameter);
  const {successMessage} = useSelector(({movements}) => movements);
  console.log('successMessage', successMessage);
  const {routeToReferralGuide} = useSelector(({movements}) => movements);
  console.log('routeToReferralGuide', routeToReferralGuide);
  const {errorMessage} = useSelector(({movements}) => movements);
  console.log('errorMessage', errorMessage);
  const {getCarriersRes} = useSelector(({carriers}) => carriers);
  console.log('getCarriersRes', getCarriersRes);
  const {updateGenerateReferralGuideRes} = useSelector(
    ({movements}) => movements,
  );
  console.log('updateGenerateReferralGuideRes', updateGenerateReferralGuideRes);
  const {jwtToken} = useSelector(({general}) => general);
  console.log('jwtToken', jwtToken);

  const toGetCarriers = (payload, token) => {
    dispatch(getCarriers(payload, token));
  };
  const toAddReferrealGuide = (payload) => {
    dispatch(addReferrealGuide(payload));
  };
  const toGetMovements = (payload) => {
    dispatch(getMovements(payload));
  };
  const getBusinessParameter = (payload) => {
    dispatch(onGetBusinessParameter(payload));
  };
  const updateReferralGuide = (payload) => {
    dispatch(updateReferralGuideValue(payload));
  };

  let listCarriersPayload = {
    request: {
      payload: {
        typeDocumentCarrier: '',
        numberDocumentCarrier: '',
        denominationCarrier: '',
        merchantId: userDataRes.merchantSelected.merchantId,
      },
    },
  };
  let businessParameterPayload = {
    request: {
      payload: {
        abreParametro: null,
        codTipoparametro: null,
        merchantId: userDataRes.merchantSelected.merchantId,
      },
    },
  };
  let listPayload = {
    request: {
      payload: {
        initialTime: null,
        finalTime: null,
        businessProductCode: null,
        movementType: 'OUTPUT',
        merchantId: userDataRes.merchantSelected.merchantId,
      },
    },
  };
  let listMovements = {
    request: {
      payload: {
        initialTime: null,
        finalTime: null,
        businessProductCode: null,
        movementType: 'OUTPUT',
        merchantId: userDataRes.merchantSelected.merchantId,
        timestampMovement: null,
        searchByDocument: null,
        movementHeaderId: null,
        outputId: null,
      },
    },
  };

  useEffect(() => {
    dispatch({type: FETCH_SUCCESS, payload: undefined});
    dispatch({type: FETCH_ERROR, payload: undefined});
    dispatch({type: GET_BUSINESS_PARAMETER, payload: undefined});
    getBusinessParameter(businessParameterPayload);
    toGetCarriers(listCarriersPayload, jwtToken);
    originalUbigeos.map((obj, index) => {
      parsedUbigeos[index] = {
        label: `${obj.descripcion} - ${obj.ubigeo}`,
        ...obj,
      };
    });
    console.log('parsedUbigeos', parsedUbigeos);
    setUbigeoStartingPoint(parsedUbigeos[0].ubigeo);
    setSelectedArrivalUbigeo(parsedUbigeos[0]);
    setSelectedStartingUbigeo(parsedUbigeos[0]);
    setUbigeoArrivalPoint(parsedUbigeos[0].ubigeo);
    console.log('parsedUbigeos[0]', parsedUbigeos[0]);

    setTimeout(() => {
      setMinTutorial(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (businessParameter != undefined) {
      let serieParameter = businessParameter.find(
        (obj) => obj.abreParametro == 'SERIES_REFERRAL_GUIDE',
      );
      console.log('serieParameter', serieParameter);
      console.log('serieParameter.metadata', serieParameter.metadata);
      setSerial(serieParameter.metadata ? serieParameter.metadata : '');
    }
  }, [businessParameter]);

  const queryDistribution = () => {
    return (
      'useLocaleRoute' in query &&
      query.useLocaleRoute == 'true' &&
      routeToReferralGuide
    );
  };

  useEffect(() => {
    if (
      getMovementsRes === undefined ||
      !Array.isArray(getMovementsRes) ||
      getMovementsRes.length < 1
    ) {
      toGetMovements(listMovements);
    }
    if (getMovementsRes && getMovementsRes.length !== 0) {
      let weight = 0;
      let output = getMovementsRes.find(
        (obj) => obj.movementHeaderId == query.movementHeaderId,
      );
      console.log('output', output);
      setSelectedOutput(output);
      if (!('useLocaleRoute' in query)) {
        console.log(
          'output.descriptionProductsInfo',
          output.descriptionProductsInfo,
        );
        setSelectedProducts(output.descriptionProductsInfo);
        output.descriptionProductsInfo.map((obj) => {
          weight += obj.weight * obj.quantityMovement;
        });
        console.log('weight', weight);

        changeValueField('addressee', output.clientName);
        changeValueField('clientEmail', output.clientEmail);
      } else if (queryDistribution()) {
        const date = routeToReferralGuide.transferStartDate;
        const dateTranslate = strDateToDateObject(date);
        console.log('date', dateTranslate);
        setDateStartTransfer(dateTranslate);

        let startingUbigeo = parsedUbigeos.find(
          (ubigeo) => ubigeo.ubigeo == routeToReferralGuide.startingPointUbigeo,
        );
        let arrivalUbigeo = parsedUbigeos.find(
          (ubigeo) => ubigeo.ubigeo == routeToReferralGuide.arrivalPointUbigeo,
        );
        setUbigeoStartingPoint(startingUbigeo.ubigeo);
        setUbigeoArrivalPoint(arrivalUbigeo.ubigeo);
        setExistArrivalUbigeo(true);
        setSelectedStartingUbigeo(startingUbigeo);
        setSelectedArrivalUbigeo(arrivalUbigeo);
        setExistStartingUbigeo(true);
        changeValueField(
          'startingPoint',
          routeToReferralGuide.startingPointAddress,
        );
        changeValueField(
          'arrivalPoint',
          routeToReferralGuide.arrivalPointAddress,
        );

        changeValueField(
          'numberPackages',
          routeToReferralGuide.numberOfPackages,
        );
        setTransportModeVal(routeToReferralGuide.typeOfTransport);
        setReasonVal(routeToReferralGuide.reasonForTransfer);

        setSelectedProducts(routeToReferralGuide.productsInfo);
        console.log('productos a pasar', routeToReferralGuide.productsInfo);
        weight = routeToReferralGuide.totalGrossWeight;
        console.log('weight', weight);

        const carrier = {
          typeDocumentCarrier: routeToReferralGuide.carrierDocumentType,
          carrierDocumentNumber: routeToReferralGuide.carrierDocumentNumber,
          denominationCarrier: routeToReferralGuide.carrierDenomination,
        };
        setSelectedCarrier(carrier);
        setExistCarrier(true);
        changeValueField('addressee', routeToReferralGuide.carrierDenomination);
        changeValueField(
          'licensePlate',
          routeToReferralGuide.carrierPlateNumber,
        );
        changeValueField('driverName', routeToReferralGuide.driverDenomination);
        changeValueField(
          'driverLastName',
          routeToReferralGuide.driverLastName
            ? routeToReferralGuide.driverLastName
            : '',
        );
        if (
          routeToReferralGuide.carrierDocumentType &&
          typeof routeToReferralGuide.carrierDocumentType === 'string'
        ) {
          setDriverDocumentType(
            routeToReferralGuide.driverDocumentType.toString().toUpperCase(),
          );
        }
        changeValueField(
          'driverDocumentNumber',
          routeToReferralGuide.driverDocumentNumber,
        );
        changeValueField(
          'driverLicenseNumber',
          routeToReferralGuide.driverLicenseNumber
            ? routeToReferralGuide.driverLicenseNumber
            : '',
        );
        changeValueField('observation', routeToReferralGuide.observation);
      }
      setTotalWeight(weight);
      changeValueField('totalWeight', weight);
      /* dispatch({
        type: ROUTE_TO_REFERRAL_GUIDE,
        payload: null,
      }); */
    }
  }, [getMovementsRes, routeToReferralGuide]);

  useEffect(() => {
    if (successMessage && addReferralGuideRes && changeGenerateRG) {
      dispatch({
        type: UPDATE_GENERATE_REFERRAL_GUIDE_VALUE,
        payload: undefined,
      });
      dispatch({type: FETCH_SUCCESS, payload: undefined});
      dispatch({type: FETCH_ERROR, payload: undefined});
      console.log('dataFinal', dataFinal);
      routeToReferralGuide.deliveries.find((delivery) => delivery);
      const parsedProducts = dataFinal.productsInfo.map((prod) => {
        return {
          productId: '',
          product: prod.product,
          description: prod.description,
          unitMeasure: prod.unitMeasure,
          quantityMovement: prod.quantityMovement,
          businessProductCode: prod.businessProductCode,
        };
      });

      const indexDelivery = routeToReferralGuide.deliveries.findIndex(
        (delivery) =>
          delivery.localRouteId === routeToReferralGuide.localRouteId,
      );
      let changedDelivery = {
        arrivalPointAddress: dataFinal.arrivalPointAddress,
        serialNumber: addReferralGuideRes.serialNumber,
        arrivalPointUbigeo: dataFinal.arrivalPointUbigeo,
        generateReferralGuide: true,
        localRouteId: routeToReferralGuide.localRouteId,
        destination: dataFinal.arrivalPointAddress,
        driverDocumentNumber: dataFinal.driverDocumentNumber,
        driverDenomination: dataFinal.driverDenomination,
        productsInfo: parsedProducts,
        numberOfPackages: dataFinal.numberOfPackages,
        carrierDenomination: dataFinal.carrierDenomination,
        driverDocumentType: dataFinal.driverDocumentType,
        totalGrossWeight: dataFinal.totalGrossWeight,
        referralGuideMovementHeaderId:
          addReferralGuideRes.referralGuideMovementHeaderId,
        driverLicenseNumber: dataFinal.driverLicenseNumber,
        driverId: '',
        carrierPlateNumber: dataFinal.carrierPlateNumber,
        carrierDocumentType: dataFinal.carrierDocumentType,
        transferStartDate: dataFinal.transferStartDate,
        driverLastName: dataFinal.driverLastName,
        carrierDocumentNumber: dataFinal.carrierDocumentNumber,
        startingPointUbigeo: dataFinal.startingPointUbigeo,
        startingPointAddress: dataFinal.startingPointAddress,
      };
      let parsedDeliveries = routeToReferralGuide.deliveries;
      parsedDeliveries[indexDelivery] = changedDelivery;
      let payloadUpdateRF = {
        request: {
          payload: {
            userActor: userAttributes['sub'],
            deliveries: parsedDeliveries,
            deliveryDistributionId: routeToReferralGuide.deliveryDistributionId,
          },
        },
      };
      updateReferralGuide(payloadUpdateRF);
      setChangeGenerateRG(false);
    }
  }, [successMessage, errorMessage, addReferralGuideRes]);

  const defaultValues = {
    nroReferralGuide: 'Autogenerado',
    addressee: '',
    totalWeight: totalWeight,
    numberPackages: 1,
    startingPoint: '',
    arrivalPoint: '',
    licensePlate: '',
    driverName: '',
    driverLastName: '',
    driverDocumentNumber: '',
    driverLicenseNumber: '',
    observation: '',
    clientEmail: '',
  };

  const handleData = (data, {setSubmitting}) => {
    setSubmitting(true);
    dispatch({type: FETCH_SUCCESS, payload: undefined});
    dispatch({type: FETCH_ERROR, payload: undefined});
    dispatch({type: ADD_REFERRAL_GUIDE, payload: undefined});
    /* dispatch({
      type: ROUTE_TO_REFERRAL_GUIDE,
      payload: undefined,
    }); */
    console.log(
      'existArrivalUbigeo && existStartingUbigeo && existCarrier',
      existArrivalUbigeo,
      existStartingUbigeo,
      existCarrier,
    );
    if (existArrivalUbigeo && existStartingUbigeo && existCarrier) {
      let parsedProducts = [];
      if (selectedProducts.length !== 0) {
        selectedProducts.map((obj) => {
          parsedProducts.push({
            product: obj.product,
            quantityMovement: obj.quantityMovement,
            customCodeProduct: obj.customCodeProduct,
            description: obj.description,
            unitMeasure: obj.unitMeasure,
            businessProductCode: obj.businessProductCode,
          });
        });
      }

      let docMoves = [];
      if (
        selectedOutput &&
        selectedOutput.documentsMovement &&
        selectedOutput.documentsMovement.length !== 0
      ) {
        selectedOutput.documentsMovement.map((obj) => {
          docMoves.push({
            issueDate: obj.issueDate,
            typeDocument: obj.typeDocument,
            serialDocument: obj.serialDocument,
          });
        });
      }

      let finalPayload = {
        request: {
          payload: {
            merchantId: userDataRes.merchantSelected.merchantId,
            deliveryDistributionId: routeToReferralGuide
              ? routeToReferralGuide.deliveryDistributionId
              : '',
            movementTypeMerchantId: selectedOutput.movementTypeMerchantId,
            movementHeaderId: selectedOutput.movementHeaderId,
            contableMovementId: selectedOutput.contableMovementId || '',
            timestampMovement: selectedOutput.timestampMovement,
            clientId: selectedOutput.clientId,
            issueDate: specialFormatToSunat(),
            serial: serial,
            automaticSendSunat: /* sendClient */ true,
            automaticSendClient: /* sendSunat */ true,
            reasonForTransfer: reasonVal,
            totalGrossWeight: data.totalWeight,
            numberOfPackages: data.numberPackages,
            typeOfTransport: transportModeVal,
            transferStartDate: dateWithHyphen(dateStartTransfer),
            carrierDocumentType: selectedCarrier.typeDocumentCarrier,
            carrierDocumentNumber: selectedCarrier.carrierId
              ? selectedCarrier.carrierId.split('-')[1]
              : selectedCarrier.carrierDocumentNumber,
            carrierDenomination: selectedCarrier.denominationCarrier,
            carrierId: selectedCarrier.carrierId,
            carrierPlateNumber:
              /* selectedCarrier.plateNumberCarrier */ data.licensePlate,
            driverDocumentType: driverDocumentType.toLowerCase(),
            driverDocumentNumber: data.driverDocumentNumber,
            driverLicenseNumber: data.driverLicenseNumber,
            driverDenomination: data.driverName,
            driverLastName: data.driverLastName,
            startingPointUbigeo: ubigeoStartingPoint.toString(),
            startingPointAddress: data.startingPoint,
            arrivalPointUbigeo: ubigeoArrivalPoint.toString(),
            arrivalPointAddress: data.arrivalPoint,
            observation: data.observation,
            productsInfo: parsedProducts,
            documentsMovement: selectedOutput.documentsMovement,
            clientEmail: selectedOutput.clientEmail,
            typePDF: userDataRes.merchantSelected.typeMerchant,
            folderMovement: selectedOutput.folderMovement,
            denominationMerchant:
              userDataRes.merchantSelected.denominationMerchant,
          },
        },
      };
      console.log('finalPayload', finalPayload);
      setDataFinal(finalPayload.request.payload);
      toAddReferrealGuide(finalPayload);
      console.log('queryDistribution', queryDistribution());
      if (queryDistribution()) {
        setChangeGenerateRG(true);
      }
      setTypeDialog('add');
      setOpenDialog(true);
    }
    setSubmitting(false);
  };

  const cancel = () => {
    setTypeDialog('confirmCancel');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    if (typeDialog === 'add') {
      /* if (
        !(selectedOutput.existBill && selectedOutput.existReferralGuide) &&
        updateGenerateReferralGuideRes !== undefined &&
        !('error' in updateGenerateReferralGuideRes)
      ) {
        dispatch({type: GET_MOVEMENTS, payload: undefined});
        toGetMovements(listPayload);
        setShowForms(true);
      } else { */
      Router.push('/sample/outputs/table');
      /* } */
    }
    setOpenDialog(false);
  };

  const registerSuccess = () => {
    console.log('queryDistribution() 1', queryDistribution());
    if (queryDistribution()) {
      return (
        successMessage != undefined &&
        updateGenerateReferralGuideRes != undefined &&
        (!('error' in updateGenerateReferralGuideRes) ||
          objectsAreEqual(updateGenerateReferralGuideRes.error, {}))
      );
    } else {
      return (
        successMessage != undefined &&
        addReferralGuideRes != undefined &&
        (!('error' in addReferralGuideRes) ||
          objectsAreEqual(addReferralGuideRes.error, {}))
      );
    }
  };
  const registerError = () => {
    console.log('queryDistribution() 1', queryDistribution());
    if (queryDistribution()) {
      return (
        (successMessage != undefined &&
          updateGenerateReferralGuideRes &&
          'error' in updateGenerateReferralGuideRes &&
          !objectsAreEqual(updateGenerateReferralGuideRes.error, {})) ||
        errorMessage != undefined
      );
    } else {
      return (
        (successMessage != undefined &&
          addReferralGuideRes &&
          'error' in addReferralGuideRes &&
          !objectsAreEqual(addReferralGuideRes.error, {})) ||
        errorMessage != undefined
      );
    }
  };

  const sendStatus = () => {
    if (registerSuccess()) {
      closeDialog();
      setOpenDialog(false);
    } else if (registerError()) {
      setOpenDialog(false);
    } else {
      setOpenDialog(false);
    }
  };

  const showMessage = () => {
    if (registerSuccess()) {
      return (
        <>
          <DialogContent sx={{display: 'flex', justifyContent: 'center'}}>
            <CheckCircleOutlineOutlinedIcon
              color='success'
              sx={{fontSize: '6em', mx: 2}}
            />
            <DialogContentText
              sx={{fontSize: '1.2em', m: 'auto'}}
              id='alert-dialog-description'
            >
              Se ha registrado la información <br />
              correctamente
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{justifyContent: 'center'}}>
            <Button variant='outlined' onClick={sendStatus}>
              Aceptar
            </Button>
          </DialogActions>
        </>
      );
    } else if (registerError()) {
      return (
        <>
          <DialogContent sx={{display: 'flex', justifyContent: 'center'}}>
            <CancelOutlinedIcon
              sx={{fontSize: '6em', mx: 2, color: red[500]}}
            />
            <DialogContentText
              sx={{fontSize: '1.2em', m: 'auto'}}
              id='alert-dialog-description'
            >
              Se ha producido un error al registrar. <br />
              {addReferralGuideRes !== undefined &&
              'error' in addReferralGuideRes
                ? addReferralGuideRes.error
                : null}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{justifyContent: 'center'}}>
            <Button variant='outlined' onClick={() => setOpenDialog(false)}>
              Aceptar
            </Button>
          </DialogActions>
        </>
      );
    } else {
      return <CircularProgress disableShrink sx={{mx: 'auto', my: '20px'}} />;
    }
  };

  const showCancelMessage = () => {
    return (
      <>
        <PriorityHighIcon sx={{fontSize: '6em', mx: 2, color: red[500]}} />
        <DialogContentText
          sx={{fontSize: '1.2em', m: 'auto'}}
          id='alert-dialog-description'
        >
          Desea cancelar esta operación?. <br /> Se perderá la información
          ingresada
        </DialogContentText>
      </>
    );
  };

  const showSelectCarrier = () => {
    return <SelectCarrier fcData={saveCarrier} />;
  };

  const handleSendClient = (event, isInputChecked) => {
    setSendClient(isInputChecked);
    console.log('Enviar a cliente', isInputChecked);
  };
  const handleSendSunat = (event, isInputChecked) => {
    setSendSunat(isInputChecked);
    console.log('Enviar a Sunat', isInputChecked);
  };
  const handleDriverDocumentType = (event) => {
    setDriverDocumentType(event.target.value);
    console.log('Tipo de documento conductor', event.target.value);
  };

  const openSelectCarrier = () => {
    setTypeDialog('selectCarrier');
    setOpenDialog(true);
  };

  const saveCarrier = (carrier) => {
    setSelectedCarrier(carrier);
    setExistCarrier(true);
    console.log('Transportista', carrier);
    setOpenDialog(false);
  };

  const searchAProduct = () => {
    setOpenAddProduct(true);
  };
  const getNewProduct = (product) => {
    console.log('ver ahora nuevo producto', product);
    console.log('ver ahora selectedProducts', selectedProducts);
    let newProducts = selectedProducts;
    if (newProducts && newProducts.length >= 1) {
      newProducts.map((obj, index) => {
        console.log('obj', obj);
        if (
          obj.product == product.product &&
          obj.description == product.description &&
          obj.customCodeProduct == product.customCodeProduct
        ) {
          console.log('selectedProducts 1', newProducts);
          newProducts.splice(index, 1);
          console.log('newProducts 2', newProducts);
        }
      });
    }
    newProducts.push(product);
    setSelectedProducts(newProducts);
    calculateWeight(newProducts);
    forceUpdate();
  };

  const calculateWeight = (products) => {
    let weight = 0;
    if (products.length >= 1) {
      products.map((obj) => {
        weight += obj.weight * obj.quantityMovement;
      });
    }
    console.log('weight', weight);
    setTotalWeight(weight);
    changeValueField('totalWeight', weight);
  };

  const removeProduct = (index) => {
    let newProducts = selectedProducts;
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
    calculateWeight(newProducts);
    forceUpdate();
  };

  const availableUbigeos = () => {
    return (
      parsedUbigeos && Array.isArray(parsedUbigeos) && parsedUbigeos.length >= 1
    );
  };

  return (
    <Card sx={{p: 4}}>
      <Box sx={{width: 1, textAlign: 'center'}}>
        <Typography
          sx={{mx: 'auto', my: '10px', fontWeight: 600, fontSize: 25}}
        >
          GENERAR GUÍA DE REMISIÓN
        </Typography>
      </Box>
      <Divider sx={{mt: 2, mb: 4}} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mb: 5,
          mx: 'auto',
        }}
      >
        <Formik
          validateOnChange={false}
          validationSchema={validationSchema}
          initialValues={{...defaultValues}}
          onSubmit={handleData}
        >
          {({isSubmitting, setFieldValue, values}) => {
            changeValueField = setFieldValue;
            {
              console.log('values', values);
            }
            return (
              <Form
                style={{textAlign: 'left', justifyContent: 'center'}}
                noValidate
                autoComplete='on'
                /* onChange={handleActualData} */
              >
                <Grid container spacing={2} sx={{width: 500, margin: 'auto'}}>
                  <Grid item xs={4}>
                    <AppTextField
                      label='Nro Guía de Remisión'
                      name='nroReferralGuide'
                      disabled
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <DesktopDatePicker
                      renderInput={(params) => (
                        <TextField
                          sx={{position: 'relative', bottom: '-8px'}}
                          {...params}
                        />
                      )}
                      required
                      value={issueDate}
                      disabled
                      label='Fecha de emisión'
                      inputFormat='dd/MM/yyyy'
                      name='issueDate'
                      onChange={(newValue) => {
                        console.log('Fecha de emisión', issueDate);
                        console.log('Campo de fecha', newValue);
                        setIssueDate(newValue);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <DesktopDatePicker
                      renderInput={(params) => (
                        <TextField
                          sx={{position: 'relative', bottom: '-8px'}}
                          {...params}
                        />
                      )}
                      required
                      value={dateStartTransfer}
                      label='Fecha inicio traslado'
                      inputFormat='dd/MM/yyyy'
                      name='dateStartTransfer'
                      onChange={(newValue) => {
                        setDateStartTransfer(newValue);
                        console.log('Fecha de inicio de traslado', newValue);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Destinatario'
                      name='addressee'
                      disabled
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth sx={{my: 2}}>
                      <InputLabel
                        id='transportMode-label'
                        style={{fontWeight: 200}}
                      >
                        Modalidad de transporte
                      </InputLabel>
                      <Select
                        sx={{textAlign: 'left'}}
                        onChange={(event) => {
                          setTransportModeVal(event.target.value);
                          console.log('modo de transporte', event.target.value);
                        }}
                        name='transportMode'
                        labelId='transportMode-label'
                        label='Modalidad de transporte'
                        value={transportModeVal}
                      >
                        <MenuItem
                          value='privateTransportation'
                          style={{fontWeight: 200}}
                        >
                          Transporte privado
                        </MenuItem>
                        <MenuItem
                          value='publicTransportation'
                          style={{fontWeight: 200}}
                        >
                          Transporte público
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth sx={{my: 2}}>
                      <InputLabel id='reason-label' style={{fontWeight: 200}}>
                        Motivo
                      </InputLabel>
                      <Select
                        sx={{textAlign: 'left'}}
                        onChange={(event) => {
                          setReasonVal(event.target.value);
                          console.log('Motivo', event.target.value);
                        }}
                        name='reason'
                        labelId='reason-label'
                        label='Modo'
                        value={reasonVal}
                      >
                        <MenuItem value='sale' style={{fontWeight: 200}}>
                          Venta
                        </MenuItem>
                        <MenuItem
                          value='saleSubjectToBuyersConfirmation'
                          style={{fontWeight: 200}}
                        >
                          Venta sujeta a confirmación del comprador
                        </MenuItem>
                        <MenuItem value='BUY' style={{fontWeight: 200}}>
                          Compra
                        </MenuItem>
                        <MenuItem
                          value='transferBetweenEstablishmentsOfTheSameCompany'
                          style={{fontWeight: 200}}
                        >
                          Traslado entre establecimientos de la misma empresa
                        </MenuItem>
                        <MenuItem
                          value='transferItinerantIssuerCP'
                          style={{fontWeight: 200}}
                        >
                          Traslado emisor itinerante CP
                        </MenuItem>
                        <MenuItem value='import' style={{fontWeight: 200}}>
                          Importación
                        </MenuItem>
                        <MenuItem value='export' style={{fontWeight: 200}}>
                          Exportación
                        </MenuItem>
                        <MenuItem
                          value='transferToPrimaryZone'
                          style={{fontWeight: 200}}
                        >
                          Traslado a zona primaria
                        </MenuItem>
                        <MenuItem value='others' style={{fontWeight: 200}}>
                          Otros
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <AppTextField
                      label='Peso bruto total'
                      name='totalWeight'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <AppTextField
                      label='Número de bultos'
                      name='numberPackages'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <AppTextField
                      label='Correo de cliente'
                      name='clientEmail'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{mt: 2, mb: 4}} />

                <Grid container spacing={2} sx={{width: 500, margin: 'auto'}}>
                  {availableUbigeos() ? (
                    <>
                      <Grid item xs={12}>
                        <Autocomplete
                          disablePortal
                          id='combo-box-demo'
                          value={selectedStartingUbigeo}
                          isOptionEqualToValue={(option, value) =>
                            option.ubigeo === value.ubigeo
                          }
                          onChange={(option, value) => {
                            if (
                              typeof value === 'object' &&
                              value != null &&
                              value !== ''
                            ) {
                              console.log(
                                'valor ubigeo anterior',
                                ubigeoStartingPoint,
                              );
                              setUbigeoStartingPoint(value.ubigeo);
                              let selectedStringValue = parsedUbigeos.find(
                                (ubigeo) => ubigeo.ubigeo == value.ubigeo,
                              );
                              setSelectedStartingUbigeo(selectedStringValue);
                              setExistStartingUbigeo(true);
                            } else {
                              setExistStartingUbigeo(false);
                            }
                            console.log('ubigeo, punto de partida', value);
                          }}
                          options={parsedUbigeos}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Distrito - Ubigeo de punto de partida'
                              onChange={(event) => {
                                console.log('event field', event.target.value);
                                if (event.target.value === '') {
                                  console.log('si se cambia a null');
                                  setExistStartingUbigeo(false);
                                }
                              }}
                            />
                          )}
                        />
                        <Collapse in={!existStartingUbigeo}>
                          <Alert severity='error' sx={{mb: 2}}>
                            Es necesario que selecciones un ubigeo para el punto
                            de partida.
                          </Alert>
                        </Collapse>
                      </Grid>
                      <Grid item xs={12}>
                        <AppTextField
                          label='Punto de partida'
                          name='startingPoint'
                          variant='outlined'
                          sx={{
                            width: '100%',
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                            my: 2,
                            mx: 0,
                          }}
                        />
                      </Grid>
                    </>
                  ) : null}

                  {availableUbigeos() ? (
                    <>
                      <Grid item xs={12}>
                        <Autocomplete
                          disablePortal
                          id='combo-box-demo'
                          value={selectedArrivalUbigeo}
                          isOptionEqualToValue={(option, value) =>
                            option.ubigeo === value.ubigeo
                          }
                          onChange={(event, value) => {
                            if (
                              typeof value === 'object' &&
                              value != null &&
                              value !== ''
                            ) {
                              console.log(
                                'valor ubigeo anterior',
                                ubigeoArrivalPoint,
                              );
                              setUbigeoArrivalPoint(value.ubigeo);

                              let selectedStringValue = parsedUbigeos.find(
                                (ubigeo) => ubigeo.ubigeo == value.ubigeo,
                              );
                              setSelectedArrivalUbigeo(selectedStringValue);

                              setExistArrivalUbigeo(true);
                            } else {
                              setExistArrivalUbigeo(false);
                            }
                            console.log('ubigeo, punto de llegada', value);
                          }}
                          options={parsedUbigeos}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Distrito - Ubigeo de punto de llegada'
                              onChange={(event) => {
                                console.log('event field', event.target.value);
                                if (event.target.value === '') {
                                  console.log('si se cambia a null');
                                  setExistArrivalUbigeo(false);
                                }
                              }}
                            />
                          )}
                        />
                        <Collapse in={!existArrivalUbigeo}>
                          <Alert
                            severity='error'
                            /* action={
                          <IconButton
                            aria-label='close'
                            color='inherit'
                            size='small'
                            onClick={() => {
                              setExistArrivalUbigeo(false);
                            }}
                          >
                            <CloseIcon fontSize='inherit' />
                          </IconButton>
                        } */
                            sx={{mb: 2}}
                          >
                            Es necesario que selecciones un ubigeo para el punto
                            de partida.
                          </Alert>
                        </Collapse>
                      </Grid>
                      <Grid item xs={12}>
                        <AppTextField
                          label='Punto de llegada'
                          name='arrivalPoint'
                          variant='outlined'
                          sx={{
                            width: '100%',
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                            my: 2,
                            mx: 0,
                          }}
                        />
                      </Grid>
                    </>
                  ) : null}
                </Grid>

                <Divider sx={{mt: 2, mb: 4}} />

                <Grid container spacing={2} sx={{width: 500, margin: 'auto'}}>
                  <Grid item xs={8}>
                    <Button
                      sx={{width: 1}}
                      variant='outlined'
                      onClick={() => openSelectCarrier()}
                    >
                      Seleccionar transportista
                    </Button>
                  </Grid>
                  <Grid item xs={4} sx={{textAlign: 'center'}}>
                    <Typography sx={{mx: 'auto', my: '10px'}}>
                      {selectedCarrier.denominationCarrier}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sx={{textAlign: 'center'}}>
                    <Collapse in={!existCarrier}>
                      <Alert severity='error' sx={{mb: 2}}>
                        Es necesario que selecciones un ubigeo para el punto de
                        partida.
                      </Alert>
                    </Collapse>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{width: 500, margin: 'auto'}}>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Placa de vehículo'
                      name='licensePlate'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Nombre del conductor'
                      name='driverName'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Apellidos del conductor'
                      name='driverLastName'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{my: 2}}>
                      <InputLabel
                        id='driverDocumentType-label'
                        style={{fontWeight: 200}}
                      >
                        Tipo de documento identificador
                      </InputLabel>
                      <Select
                        value={driverDocumentType}
                        name='driverDocumentType'
                        labelId='driverDocumentType-label'
                        label='Tipo de documento identificador'
                        onChange={handleDriverDocumentType}
                      >
                        <MenuItem value='DNI' style={{fontWeight: 200}}>
                          DNI
                        </MenuItem>
                        <MenuItem value='RUC' style={{fontWeight: 200}}>
                          RUC
                        </MenuItem>
                        <MenuItem value='CE' style={{fontWeight: 200}}>
                          Carnet de extranjería
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Número identificador del conductor'
                      name='driverDocumentNumber'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Licencia del conductor'
                      name='driverLicenseNumber'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                        mx: 0,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppTextField
                      label='Observación'
                      name='observation'
                      variant='outlined'
                      multiline
                      rows={4}
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-input': {
                          fontSize: 14,
                        },
                        my: 2,
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sx={{my: 2}}>
                    <Button
                      sx={{width: 1}}
                      variant='outlined'
                      onClick={() => searchAProduct('product')}
                    >
                      Añade productos
                    </Button>
                  </Grid>
                </Grid>
                <Box sx={{my: 5}}>
                  <SelectedProducts
                    arrayObjs={selectedProducts}
                    toDelete={removeProduct}
                  />
                </Box>
                <ButtonGroup
                  orientation='vertical'
                  variant='outlined'
                  sx={{width: 1}}
                  aria-label='outlined button group'
                >
                  <Button
                    color='primary'
                    sx={{mx: 'auto', width: '50%', py: 3}}
                    type='submit'
                    variant='contained'
                    disabled={isSubmitting}
                    startIcon={<SaveAltOutlinedIcon />}
                  >
                    Finalizar
                  </Button>
                  <Button
                    sx={{mx: 'auto', width: '50%', py: 3}}
                    variant='outlined'
                    startIcon={<ArrowCircleLeftOutlinedIcon />}
                    onClick={cancel}
                  >
                    Cancelar
                  </Button>
                </ButtonGroup>
                {minTutorial ? (
                  <Box
                    sx={{
                      position: 'fixed',
                      right: 0,
                      top: {xs: 325, xl: 305},
                      zIndex: 1110,
                    }}
                    className='customizerOption'
                  >
                    <Box
                      sx={{
                        borderRadius: '30px 0 0 30px',
                        mb: 1,
                        backgroundColor: orange[500],
                        '&:hover': {
                          backgroundColor: orange[700],
                        },
                        '& button': {
                          borderRadius: '30px 0 0 30px',

                          '&:focus': {
                            borderRadius: '30px 0 0 30px',
                          },
                        },
                      }}
                    >
                      <IconButton
                        sx={{
                          mt: 1,
                          '& svg': {
                            height: 35,
                            width: 35,
                          },
                          color: 'white',
                          pr: 5,
                        }}
                        edge='end'
                        color='inherit'
                        aria-label='open drawer'
                        onClick={() =>
                          window.open('https://youtu.be/eGpwPJ6USVM/')
                        }
                      >
                        <YouTubeIcon fontSize='inherit' />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'fixed',
                      right: 0,
                      top: {xs: 325, xl: 305},
                      zIndex: 1110,
                    }}
                    className='customizerOption'
                  >
                    <Box
                      sx={{
                        borderRadius: '30px 0 0 30px',
                        mb: 1,
                        backgroundColor: orange[500],
                        '&:hover': {
                          backgroundColor: orange[700],
                        },
                        '& button': {
                          borderRadius: '30px 0 0 30px',

                          '&:focus': {
                            borderRadius: '30px 0 0 30px',
                          },
                        },
                      }}
                    >
                      <IconButton
                        sx={{
                          mt: 1,
                          '& svg': {
                            height: 35,
                            width: 35,
                          },
                          color: 'white',
                        }}
                        edge='end'
                        color='inherit'
                        aria-label='open drawer'
                        onClick={() =>
                          window.open('https://youtu.be/eGpwPJ6USVM/')
                        }
                      >
                        VER TUTORIAL
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Form>
            );
          }}
        </Formik>
      </Box>

      <Dialog
        open={openDialog}
        onClose={sendStatus}
        sx={{textAlign: 'center'}}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='xl'
      >
        <DialogTitle sx={{fontSize: '1.5em'}} id='alert-dialog-title'>
          <Box sx={{mx: 10}}>
            {(typeDialog == 'add') | (typeDialog == 'confirmCancel')
              ? 'Registro de Guía de Remisión'
              : null}
            {typeDialog == 'selectCarrier'
              ? 'Selecciona un transportista'
              : null}
          </Box>
          <IconButton
            aria-label='close'
            onClick={sendStatus}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {typeDialog == 'add' ? (
          showMessage()
        ) : (
          <DialogContent sx={{display: 'flex', justifyContent: 'center'}}>
            {typeDialog == 'confirmCancel' ? showCancelMessage() : null}
            {typeDialog == 'selectCarrier' ? showSelectCarrier() : null}
          </DialogContent>
        )}

        <DialogActions sx={{justifyContent: 'center'}}>
          {/* {typeDialog == 'add' ? (
            <Button variant='outlined' onClick={closeDialog}>
              Aceptar
            </Button>
          ) : null} */}

          {typeDialog == 'confirmCancel' ? (
            <>
              <Button
                variant='outlined'
                onClick={() => {
                  Router.push('/sample/outputs/table');
                }}
              >
                Sí
              </Button>
              <Button variant='outlined' onClick={() => setOpenDialog(false)}>
                No
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog
        open={showForms}
        onClose={() => Router.push('/sample/outputs/table')}
        sx={{textAlign: 'center'}}
        fullWidth
        maxWidth='xs'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent sx={{display: 'flex', justifyContent: 'center'}}>
          <DialogContentText
            sx={{fontSize: '1.2em', m: 'auto'}}
            id='alert-dialog-description'
          >
            {getMovementsRes && Array.isArray(getMovementsRes) ? (
              <>
                {!selectedOutput.existBill ? (
                  <Button
                    color='primary'
                    sx={{width: 1, px: 7, my: 2}}
                    variant='contained'
                    onClick={() => {
                      Router.push({
                        pathname: '/sample/bills/get',
                        query: getMovementsRes.find(
                          (obj) =>
                            obj.movementHeaderId ==
                            selectedOutput.movementHeaderId,
                        ),
                      });
                    }}
                  >
                    Generar Factura
                  </Button>
                ) : null}
                {selectedOutput.existBill ? (
                  <Button
                    color='primary'
                    sx={{width: 1, px: 7, my: 2}}
                    variant='contained'
                    onClick={() => {
                      Router.push({
                        pathname: '/sample/finances/new-earning',
                        query: getMovementsRes.find(
                          (obj) =>
                            obj.movementHeaderId ==
                            selectedOutput.movementHeaderId,
                        ),
                      });
                    }}
                  >
                    Generar Ingreso
                  </Button>
                ) : null}
                <Button
                  color='primary'
                  sx={{width: 1, px: 7, my: 2}}
                  variant='outlined'
                  onClick={() => Router.push('/sample/outputs/table')}
                >
                  Ir a Listado
                </Button>
              </>
            ) : (
              <CircularProgress />
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openAddProduct}
        onClose={() => setOpenAddProduct(false)}
        sx={{textAlign: 'center'}}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle sx={{fontSize: '1.5em'}} id='alert-dialog-title'>
          {'Selecciona los productos'}
          <CancelOutlinedIcon
            onClick={() => setOpenAddProduct(false)}
            sx={{
              cursor: 'pointer',
              float: 'right',
              marginTop: '5px',
              width: '20px',
            }}
          />
        </DialogTitle>
        <DialogContent>
          <AddProductForm type='input' sendData={getNewProduct} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GetReferralGuide;
