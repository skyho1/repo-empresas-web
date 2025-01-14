import React, {useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';

import DeleteIcon from '@mui/icons-material/Delete';

let listPayload = {
  request: {
    payload: {
      businessProductCode: null,
      description: null,
      merchantId: 'KX824',
    },
  },
};

const OutputProducts = ({data, toDelete}) => {
  //FUNCIONES MENU
  const {userAttributes} = useSelector(({user}) => user);

  const {userDataRes} = useSelector(({user}) => user);
  listPayload.request.payload.merchantId =
    userDataRes.merchantSelected.merchantId;

  const deleteProduct = (index) => {
    console.log('Index', index);
    toDelete(index);
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{minWidth: 650}} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Valor unitario</TableCell>
            <TableCell>Subtotal</TableCell>
            <TableCell>Opciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && typeof data !== 'string' ? (
            data.map((obj, index) => {
              return (
                <TableRow
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
                  key={index}
                  id={index}
                >
                  <TableCell>{obj.businessProductCode}</TableCell>
                  <TableCell>{obj.description}</TableCell>
                  <TableCell>{obj.unitMeasure}</TableCell>
                  <TableCell>{obj.quantityMovement}</TableCell>
                  <TableCell>{obj.priceBusinessMoneyWithIgv}</TableCell>
                  <TableCell>{obj.subtotal}</TableCell>
                  <TableCell>
                    <IconButton onClick={deleteProduct.bind(this, index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <></>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

OutputProducts.propTypes = {
  data: PropTypes.array.isRequired,
  toDelete: PropTypes.array.isRequired,
};
export default OutputProducts;
