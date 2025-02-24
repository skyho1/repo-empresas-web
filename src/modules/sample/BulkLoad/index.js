import React, {useEffect} from 'react';
import {
  Divider,
  Card,
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Tab,
  Collapse,
  Alert,
} from '@mui/material';

import IntlMessages from '../../../@crema/utility/IntlMessages';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import AppTextField from '../../../@crema/core/AppFormComponents/AppTextField';

import AppGridContainer from '../../../@crema/core/AppGridContainer';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import {red} from '@mui/material/colors';
import PropTypes from 'prop-types';
import {Fonts} from '../../../shared/constants/AppEnums';
import {makeStyles} from '@mui/styles';
import Router, {useRouter} from 'next/router';
import {useDispatch, useSelector} from 'react-redux';
import {array} from 'prop-types';
import {getUserData} from '../../../redux/actions/User';
import {getCurrentMovementsDocumentsBusiness} from '../../../redux/actions/MyBilling';
import {exportExcelTemplateToBulkLoad} from '../../../redux/actions/General';
import {
  getYear,
  getActualMonth,
  translateValue,
  fixDecimals,
} from '../../../Utils/utils';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
const maxLength = 11111111111111111111; //20 caracteres
const validationSchema = yup.object({
  name: yup
    .string()
    .typeError(<IntlMessages id='validation.string' />)
    .required(<IntlMessages id='validation.required' />)
    .matches(/^[a-z0-9\s]+$/i, 'No se permiten caracteres especiales'),
});
const defaultValues = {
  name: '',
};

import {
  FETCH_SUCCESS,
  FETCH_ERROR,
  GET_USER_DATA,
  GET_BUSINESS_PARAMETER,
  GET_CURRENT_MOVEMENTS_DOCUMENTS,
  UPDATE_CATALOGS,
  GENERATE_EXCEL_TEMPLATE_TO_ROUTES,
} from '../../../shared/constants/ActionTypes';
import {
  onGetBusinessParameter,
  updateAllBusinessParameter,
  updateCatalogs,
} from '../../../redux/actions/General';
import myBilling from 'pages/sample/myBilling';
import {ConstructionRounded} from '@mui/icons-material';
//ESTILOS
const useStyles = makeStyles((theme) => ({
  icon: {
    width: '30px',
    height: '30px',
    marginRight: '10px',
  },
  tableRow: {
    '&:last-child th, &:last-child td': {
      borderBottom: 0,
    },
  },
}));

let typeAlert = '';
let msjError = '';
function LinearProgressWithLabel(props) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <Box sx={{width: '100%', mr: 1}}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{minWidth: 35}}>
        <Typography variant='body2' color='text.secondary'>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

const XLSX = require('xlsx');

const BulkLoad = (props) => {
  const classes = useStyles(props);
  const dispatch = useDispatch();
  const router = useRouter();
  const {query} = router; //query es el objeto seleccionado
  console.log('query', query);

  const [typeAlert, setTypeAlert] = React.useState(
    'existProductsWithThisCategory',
  );
  const [excelOrCsv, setExcelOrCsv] = React.useState('');
  const [excelOrCsvName, setExcelOrCsvName] = React.useState('');
  const [downloadExcel, setDownloadExcel] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  //GET APIS RES
  const {userDataRes} = useSelector(({user}) => user);
  const {updateCatalogsRes} = useSelector(({general}) => general);
  console.log('updateCatalogsRes', updateCatalogsRes);
  const {generalSuccess} = useSelector(({general}) => general);
  console.log('generalSuccess', generalSuccess);
  const {generalError} = useSelector(({general}) => general);
  console.log('generalError', generalError);
  const {excelTemplateGeneratedToBulkLoadRes} = useSelector(
    ({general}) => general,
  );

  const toUpdateCatalogs = (payload) => {
    dispatch(updateCatalogs(payload));
  };

  const toExportExcelTemplateToBulkLoad = (payload) => {
    dispatch(exportExcelTemplateToBulkLoad(payload));
  };

  useEffect(() => {
    if (!userDataRes) {
      console.log('Esto se ejecuta?');
      dispatch({type: GET_USER_DATA, payload: undefined});

      const toGetUserData = (payload) => {
        dispatch(getUserData(payload));
      };
      let getUserDataPayload = {
        request: {
          payload: {
            userId: JSON.parse(localStorage.getItem('payload')).sub,
          },
        },
      };

      toGetUserData(getUserDataPayload);
    }
  }, []);

  const processData = (data) => {
    const keys = data[0];
    const datav2 = data
      .slice(1)
      .filter((row) => row[0] !== undefined && row[0] !== null)
      .map((row) =>
        keys.reduce((obj, key, i) => {
          obj[key] = row[i];
          return obj;
        }, {}),
      );
    return datav2;
  };

  const onChangeHandler = (event) => {
    if (excelOrCsv && excelOrCsv.target.files) {
      const reader = new FileReader();
      reader.onload = (excelOrCsv) => {
        const bstr = excelOrCsv.target.result;
        const wb = XLSX.read(bstr, {type: 'binary'});
        console.log('wb', wb);

        let tipoProducto = {
          tipos: [
            {nombre: 'Insumo'},
            {nombre: 'Producto intermedio'},
            {nombre: 'Producto final'},
          ],
        };
        let tipoIdentificador = {
          tipos: [{nombre: 'RUC'}, {nombre: 'DNI'}, {nombre: 'CE'}],
        };

        const productsSheet = wb.Sheets['PRODUCTOS'];
        const productsData = XLSX.utils.sheet_to_json(productsSheet, {
          header: 1,
        });
        const productsDataV2 = processData(productsData);

        const clientsSheet = wb.Sheets['CLIENTES'];
        const clientsData = XLSX.utils.sheet_to_json(clientsSheet, {header: 1});
        const clientsDataV2 = processData(clientsData);

        const deliveryPointsSheet = wb.Sheets['PUNTOS DE LLEGADA'];
        const deliveryPointsData = XLSX.utils.sheet_to_json(
          deliveryPointsSheet,
          {
            header: 1,
          },
        );
        const deliveryPointsDataV2 = processData(deliveryPointsData);

        const originPointsSheet = wb.Sheets['PUNTOS DE PARTIDA'];
        const originPointsData = XLSX.utils.sheet_to_json(originPointsSheet, {
          header: 1,
        });
        const originPointsDataV2 = processData(originPointsData);

        const driversSheet = wb.Sheets['CHOFERES'];
        const driversData = XLSX.utils.sheet_to_json(driversSheet, {header: 1});
        const driversDataV2 = processData(driversData);

        const carriersSheet = wb.Sheets['EMPRESA TRANSPORTISTA'];
        const carriersData = XLSX.utils.sheet_to_json(carriersSheet, {
          header: 1,
        });
        const carriersDataV2 = processData(carriersData);

        const providersSheet = wb.Sheets['PROVEEDORES'];
        const providersData = XLSX.utils.sheet_to_json(providersSheet, {
          header: 1,
        });
        const providersData2 = processData(providersData);

        console.log('productsDataV2', productsDataV2);
        console.log('routesDataV2', clientsDataV2);
        msjError = '';

        if (
          productsDataV2.length > 0 ||
          clientsDataV2.length > 0 ||
          providersData2.length > 0 ||
          carriersDataV2.length > 0 ||
          driversDataV2.length > 0 ||
          deliveryPointsDataV2.length > 0 ||
          originPointsDataV2.length > 0
        ) {
          //validaciones de contenido
          productsDataV2.forEach((product) => {
            console.log('product:::', product);

            if (!product['CODIGO']) {
              msjError =
                msjError +
                "Validación de PRODUCTO: '" +
                product['DESCRIPCION'] +
                "' debe de tener un código.  ";
            } else {
              console.log('El producto codigo', product['CODIGO']);
              if (
                product['CODIGO'].toString().includes('-') ||
                product['CODIGO'].toString().includes('|')
              ) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' tiene el símbolo | o el - en su CÓDIGO, debe de retirarlos.  ";
              }
              product['CODIGO'] = product['CODIGO'].toString().toUpperCase();
            }

            if (!product['DESCRIPCION']) {
              msjError =
                msjError +
                "Validación de PRODUCTO: Con código: '" +
                product['CODIGO'] +
                "' debe de tener una descripción.  ";
            } else {
              // Vamos a permitir que se acepte
              // if (product['DESCRIPCION'].includes('-') ||
              //   product['DESCRIPCION'].includes('|')
              //   ) {
              //     msjError = msjError + "Validación de PRODUCTO: '"+product['DESCRIPCION']+"' tiene el símbolo | o el - en su DESCRIPCIÓN, debe de retirarlos.  ";
              //   }
            }

            if (!product['ALIAS']) {
              msjError =
                msjError +
                "Validación de PRODUCTO: Con código: '" +
                product['CODIGO'] +
                "' debe de tener una descripción.  ";
            } else {
              if (
                product['ALIAS'].includes('-') ||
                product['ALIAS'].includes('|')
              ) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' tiene el símbolo | o el - en su ALIAS, debe de retirarlos.  ";
              }
            }

            //jalar categoria y validar
            if (!product['CATEGORIA']) {
              msjError =
                msjError +
                "Validación de PRODUCTO: '" +
                product['DESCRIPCION'] +
                "' debe de tener una CATEGORIA.  ";
            } else {
              ///validar q coincida con lista de categorías
            }

            if (!(product['PESO (Kg)'] === 0)) {
              if (!product['PESO (Kg)']) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' debe de tener un PESO.  ";
              } else {
                /*if (!product['PESO (Kg)']>=0
                    ) {
                      msjError = msjError + "Validación de PRODUCTO: Producto: '"+product['DESCRIPCION']+"' debe de ser valor numérico cero o positivo en PESO.  ";
                    }*/
              }
            }

            if (!(product['PRECIO COSTO'] === 0)) {
              if (!product['PRECIO COSTO']) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' debe de tener un PRECIO COSTO.  ";
              } else {
                /*if (!product['PESO (Kg)']>=0
                    ) {
                      msjError = msjError + "Validación de PRODUCTO: Producto: '"+product['DESCRIPCION']+"' debe de ser valor numérico cero o positivo en PESO.  ";
                    }*/
              }
            }

            if (!(product['PRECIO VENTA'] === 0)) {
              if (!product['PRECIO VENTA']) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' debe de tener un PRECIO VENTA.  ";
              } else {
                /*if (!product['PESO (Kg)']>=0
                    ) {
                      msjError = msjError + "Validación de PRODUCTO: Producto: '"+product['DESCRIPCION']+"' debe de ser valor numérico cero o positivo en PESO.  ";
                    }*/
              }
            }

            if (!(product['STOCK INICIAL'] === 0)) {
              if (!product['STOCK INICIAL']) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: '" +
                  product['DESCRIPCION'] +
                  "' debe de tener un STOCK INICIAL.  ";
              } else {
                /*if (!product['PESO (Kg)']>=0
                    ) {
                      msjError = msjError + "Validación de PRODUCTO: Producto: '"+product['DESCRIPCION']+"' debe de ser valor numérico cero o positivo en PESO.  ";
                    }*/
              }
            }

            if (!product['TIPO PRODUCTO']) {
              msjError =
                msjError +
                "Validación de PRODUCTO: '" +
                product['DESCRIPCION'] +
                "' debe de tener un TIPO PRODUCTO.  ";
            } else {
              const matchTipoProducto = tipoProducto.tipos.find(
                (d) => d.nombre == product['TIPO PRODUCTO'],
              );
              if (!matchTipoProducto) {
                msjError =
                  msjError +
                  "Validación de PRODUCTO: El TIPO PRODUCTO '" +
                  product['TIPO PRODUCTO'] +
                  "' no existe, debe de uno válido como 'Insumo' o 'Producto intermedio' o 'Producto final'.  ";
              }
            }

            if (product['DOSIFICACION']) {
              let productsSelected = product['DOSIFICACION']
                .split('|')
                .map((product2) => {
                  let tempprod = product2.split('-');
                  if (tempprod.length != 2) {
                    msjError =
                      msjError +
                      "Validación de PRODUCTO: '" +
                      product['DESCRIPCION'] +
                      "', con DOSIFICACIÓN: '" +
                      tempprod +
                      "' Debe de tener la estructura: PRODUCTO - CANTIDAD.  ";
                  }
                });
            }
          });

          clientsDataV2.forEach((client) => {
            console.log('client:::', client);

            if (!client['IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de CLIENTE: '" +
                client['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener un IDENTIFICADOR.  ";
            } else {
              client['IDENTIFICADOR'] = client['IDENTIFICADOR']
                .toString()
                .toUpperCase();
              const matchIdentificador = tipoIdentificador.tipos.find(
                (d) => d.nombre == client['IDENTIFICADOR'],
              );
              if (!matchIdentificador) {
                msjError =
                  msjError +
                  "Validación de CLIENTE: '" +
                  client['NOMBRE/RAZON SOCIAL'] +
                  "', con IDENTIFICADOR '" +
                  client['IDENTIFICADOR'] +
                  "' no existe, debe de uno válido como 'RUC' o 'DNI' o 'CE'.  ";
              }
            }

            if (!client['NRO IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de CLIENTE: '" +
                client['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener NRO IDENTIFICADOR.  ";
            } else {
            }

            if (!client['NOMBRE/RAZON SOCIAL']) {
              msjError =
                msjError +
                "Validación de CLIENTE: Con Nro Identificador: '" +
                client['NRO IDENTIFICADOR'] +
                "' debe de tener NOMBRE/RAZON SOCIAL.  ";
            } else {
            }

            if (!client['DIRECCION']) {
              msjError =
                msjError +
                "Validación de CLIENTE: '" +
                client['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener DIRECCION.  ";
            } else {
            }
          });

          providersData2.forEach((provider) => {
            console.log('provider:::', provider);

            if (!provider['IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de PROVEEDOR: '" +
                provider['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener un IDENTIFICADOR.  ";
            } else {
              provider['IDENTIFICADOR'] = provider['IDENTIFICADOR']
                .toString()
                .toUpperCase();
              const matchIdentificador = tipoIdentificador.tipos.find(
                (d) => d.nombre == provider['IDENTIFICADOR'],
              );
              if (!matchIdentificador) {
                msjError =
                  msjError +
                  "Validación de PROVEEDOR: '" +
                  provider['NOMBRE/RAZON SOCIAL'] +
                  "', con IDENTIFICADOR '" +
                  provider['IDENTIFICADOR'] +
                  "' no existe, debe de uno válido como 'RUC' o 'DNI' o 'CE'.  ";
              }
            }

            if (!provider['NRO IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de PROVEEDOR: '" +
                provider['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener NRO IDENTIFICADOR.  ";
            } else {
            }

            if (!provider['NOMBRE/RAZON SOCIAL']) {
              msjError =
                msjError +
                "Validación de PROVEEDOR: con Nro Identificador: '" +
                provider['NRO IDENTIFICADOR'] +
                "' debe de tener NOMBRE/RAZON SOCIAL.  ";
            } else {
            }

            if (!provider['DIRECCION']) {
              msjError =
                msjError +
                "Validación de PROVEEDOR: '" +
                provider['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener DIRECCION.  ";
            } else {
            }
          });

          carriersDataV2.forEach((carrier) => {
            console.log('carrier:::', carrier);

            if (!carrier['IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de TRANSPORTISTA: '" +
                carrier['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener un IDENTIFICADOR.  ";
            } else {
              carrier['IDENTIFICADOR'] = carrier['IDENTIFICADOR']
                .toString()
                .toUpperCase();
              const matchIdentificador = tipoIdentificador.tipos.find(
                (d) => d.nombre == carrier['IDENTIFICADOR'],
              );
              if (!matchIdentificador) {
                msjError =
                  msjError +
                  "Validación de TRANSPORTISTA: '" +
                  carrier['NOMBRE/RAZON SOCIAL'] +
                  "', con IDENTIFICADOR '" +
                  carrier['IDENTIFICADOR'] +
                  "' no existe, debe de uno válido como 'RUC' o 'DNI' o 'CE'.  ";
              }
            }

            if (!carrier['NRO IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de TRANSPORTISTA: '" +
                carrier['NOMBRE/RAZON SOCIAL'] +
                "' debe de tener NRO IDENTIFICADOR.  ";
            } else {
            }

            if (!carrier['NOMBRE/RAZON SOCIAL']) {
              msjError =
                msjError +
                "Validación de TRANSPORTISTA: con Nro Identificador: '" +
                carrier['NRO IDENTIFICADOR'] +
                "' debe de tener NOMBRE/RAZON SOCIAL.  ";
            } else {
            }
          });

          deliveryPointsDataV2.forEach((delivery) => {
            console.log('delivery:::', delivery);

            if (!delivery['COD_INTERNO']) {
              msjError =
                msjError +
                "Validación de PTOS. LLEGADA: '" +
                delivery['LUGAR'] +
                "' debe de tener un COD_INTERNO.  ";
            } else {
              delivery['COD_INTERNO'] = delivery['COD_INTERNO']
                .toString()
                .toUpperCase();
            }

            if (!delivery['LUGAR']) {
              msjError =
                msjError +
                "Validación de PTOS. LLEGADA: Con Cod_Interno '" +
                delivery['COD_INTERNO'] +
                "' debe de tener LUGAR.  ";
            } else {
            }

            if (!delivery['UBIGEO']) {
              msjError =
                msjError +
                "Validación de PTOS. LLEGADA: '" +
                delivery['LUGAR'] +
                "' debe de tener UBIGEO.  ";
            } else {
            }

            if (!delivery['DIRECCION EXACTA']) {
              msjError =
                msjError +
                "Validación de PTOS. LLEGADA: '" +
                delivery['LUGAR'] +
                "' debe de tener DIRECCION EXACTA.  ";
            } else {
            }
          });

          originPointsDataV2.forEach((origin) => {
            console.log('origin:::', origin);

            if (!origin['COD_INTERNO']) {
              msjError =
                msjError +
                "Validación de PTOS. PARTIDA: '" +
                origin['LUGAR'] +
                "' debe de tener un COD_INTERNO.  ";
            } else {
              origin['COD_INTERNO'] = origin['COD_INTERNO']
                .toString()
                .toUpperCase();
            }

            if (!origin['LUGAR']) {
              msjError =
                msjError +
                "Validación de PTOS. PARTIDA: Con Cod_Interno '" +
                origin['COD_INTERNO'] +
                "' debe de tener LUGAR.  ";
            } else {
            }

            if (!origin['UBIGEO']) {
              msjError =
                msjError +
                "Validación de PTOS. PARTIDA: '" +
                origin['LUGAR'] +
                "' debe de tener UBIGEO.  ";
            } else {
            }

            if (!origin['DIRECCION EXACTA']) {
              msjError =
                msjError +
                "Validación de PTOS. PARTIDA: '" +
                origin['LUGAR'] +
                "' debe de tener DIRECCION EXACTA.  ";
            } else {
            }
          });

          driversDataV2.forEach((driver) => {
            console.log('driver:::', driver);

            if (!driver['IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de CHOFER: '" +
                driver['NOMBRES'] +
                ' ' +
                driver['APELLIDOS'] +
                "' debe de tener un IDENTIFICADOR.  ";
            } else {
              driver['IDENTIFICADOR'] = driver['IDENTIFICADOR']
                .toString()
                .toUpperCase();
              const matchIdentificador = tipoIdentificador.tipos.find(
                (d) => d.nombre == driver['IDENTIFICADOR'],
              );
              if (!matchIdentificador) {
                msjError =
                  msjError +
                  "Validación de CHOFER: '" +
                  driver['NOMBRES'] +
                  ' ' +
                  driver['APELLIDOS'] +
                  "', con IDENTIFICADOR '" +
                  driver['IDENTIFICADOR'] +
                  "' no existe, debe de uno válido como 'RUC' o 'DNI' o 'CE'.  ";
              }
            }

            if (!driver['NRO IDENTIFICADOR']) {
              msjError =
                msjError +
                "Validación de CHOFER: '" +
                driver['NOMBRES'] +
                ' ' +
                driver['APELLIDOS'] +
                "' debe de tener NRO IDENTIFICADOR.  ";
            } else {
            }

            if (!driver['NOMBRES']) {
              msjError =
                msjError +
                "Validación de CHOFER: con Nro Identificador: '" +
                driver['NRO IDENTIFICADOR'] +
                "' debe de tener NOMBRES.  ";
            } else {
            }

            if (!driver['APELLIDOS']) {
              msjError =
                msjError +
                "Validación de CHOFER: con Nro Identificador: '" +
                driver['NRO IDENTIFICADOR'] +
                "' debe de tener APELLIDOS.  ";
            } else {
            }

            if (!driver['LICENCIA']) {
              msjError =
                msjError +
                "Validación de CHOFER: '" +
                driver['NOMBRES'] +
                ' ' +
                driver['APELLIDOS'] +
                "' debe de tener LICENCIA.  ";
            } else {
            }
          });

          //msjError='';////DESCOMENTAR ESTO PARA DESACTIVAR LAS VALIDACIONES

          if (msjError == '') {
            const payloadCatalogs = {
              request: {
                payload: {
                  merchantId: userDataRes.merchantSelected.merchantId,
                  data: {
                    products: productsDataV2,
                    clients: clientsDataV2,
                    providers: providersData2,
                    carriers: carriersDataV2,
                    drivers: driversDataV2,
                    deliveryPoints: deliveryPointsDataV2,
                    originPoints: originPointsDataV2,
                  },
                },
              },
            };
            console.log('payloadCatalogs', payloadCatalogs);
            dispatch({type: FETCH_SUCCESS, payload: undefined});
            dispatch({type: FETCH_ERROR, payload: undefined});
            dispatch({type: UPDATE_CATALOGS, payload: undefined});
            toUpdateCatalogs(payloadCatalogs);
            /*msjError="Todo ok"
            setShowAlert(true);*/
          } else {
            setShowAlert(true);
          }
        } else {
          msjError =
            'Validaciones de Carga Catálogo: Verifique las hojas del Excel. Debe de haber por lo menos un registro en PRODUCTOS, CLIENTES, PROVEEDORES, PUNTOS DE LLEGADA, PUNTOS DE PARTIDA, CHOFERES Y EMPRESA TRANSPORTISTA';
          setShowAlert(true);
        }
      };
      reader.readAsBinaryString(excelOrCsv.target.files[0]);
    } else {
      msjError =
        'Validaciones de Carga Catálogo: Archivo no existe, verifique que lo haya cargado';
      setShowAlert(true);
    }
  };
  const handleFile = (event) => {
    console.log('evento', event);
    setExcelOrCsvName(
      event.target.files[0].name.split('.').slice(0, -1).join('.'),
    );
    setExcelOrCsv(event);
  };
  const exportToExcel = () => {
    const excelPayload = {
      request: {
        payload: {
          merchantId: userDataRes.merchantSelected.merchantId,
        },
      },
    };
    console.log('excelPayload', excelPayload);
    dispatch({type: FETCH_SUCCESS, payload: undefined});
    dispatch({type: FETCH_ERROR, payload: undefined});
    dispatch({type: GENERATE_EXCEL_TEMPLATE_TO_ROUTES, payload: undefined});
    toExportExcelTemplateToBulkLoad(excelPayload);
    setDownloadExcel(true);
  };

  useEffect(() => {
    if (excelTemplateGeneratedToBulkLoadRes && downloadExcel) {
      setDownloadExcel(false);
      const byteCharacters = atob(excelTemplateGeneratedToBulkLoadRes);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulkLoadTemplate.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [excelTemplateGeneratedToBulkLoadRes, downloadExcel]);

  return userDataRes ? (
    <>
      <Card sx={{p: 4}}>
        <Stack
          direction='row'
          spacing={2}
          sx={{display: 'flex', alignItems: 'center'}}
        >
          <Typography
            component='h3'
            sx={{
              fontSize: 16,
              fontWeight: Fonts.BOLD,
              mb: {xs: 3, lg: 4},
            }}
          >
            <IntlMessages id='common.bulkLoad' />
          </Typography>
        </Stack>
        <Divider sx={{my: 2}} />
        <Box>
          <Button
            variant='outlined'
            component='label'
            endIcon={!excelOrCsvName ? <FileUploadOutlinedIcon /> : null}
          >
            {excelOrCsvName || 'Subir archivo'}
            <input
              type='file'
              hidden
              onChange={handleFile}
              on
              id='imgInp'
              name='imgInp'
              accept='.xlsx, .csv'
            />
          </Button>
          <Button
            startIcon={<SettingsIcon />}
            variant='contained'
            color='primary'
            onClick={onChangeHandler}
          >
            Procesar
          </Button>
          <Button
            startIcon={<FileDownloadOutlinedIcon />}
            variant='outlined'
            color='secondary'
            onClick={exportToExcel}
          >
            Descargar Plantilla
          </Button>
          <Collapse in={showAlert}>
            <Alert
              severity='error'
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setShowAlert(false);
                  }}
                >
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              sx={{mb: 2}}
            >
              {msjError}
            </Alert>
          </Collapse>
          {updateCatalogsRes && generalSuccess && !updateCatalogsRes.error ? (
            <>
              <CheckCircleOutlineOutlinedIcon
                color='success'
                sx={{fontSize: '1.5em', mx: 2}}
              />
            </>
          ) : (
            <></>
          )}
          {(updateCatalogsRes && updateCatalogsRes.error) || generalError ? (
            <>
              <CancelOutlinedIcon
                sx={{fontSize: '1.5em', mx: 2, color: red[500]}}
              />
              {updateCatalogsRes
                ? updateCatalogsRes.error
                : 'Hubo un error durante el proceso'}
            </>
          ) : (
            <></>
          )}
        </Box>
      </Card>
    </>
  ) : (
    <></>
  );
};

export default BulkLoad;
