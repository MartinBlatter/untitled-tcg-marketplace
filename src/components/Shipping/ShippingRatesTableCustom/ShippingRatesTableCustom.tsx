import { useShippingStore } from '@/src/store/shipping';
import { formatCurrency } from '@/src/utils/helpers';
import { Check, Close } from '@mui/icons-material';
import { Button, Card, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

const ShippingRatesTableCustom = () => {
    const t = useTranslations();
    const { usesCustom, addCustomShippingItem, CustomShippingItems } = useShippingStore();

    return (
        <Card sx={{ p: 2, position: 'relative', border: usesCustom ? '1px solid' : 'none', borderColor: usesCustom ? 'success.light' : '' }}>
            <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                {usesCustom ? <Check sx={{ height: '1.2rem', width: '1.2rem', mr: 1 }} /> : <Close sx={{ height: '1.2rem', width: '1.2rem', mr: 1 }} />} {t(`shipping.customShipping`)}
            </Typography>
            <Typography variant='body1' component={'h3'} sx={{ mt: 1, fontWeight: 'bold' }}>
                {t(`shipping.domestic`)}
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('shipping.form.type')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.cards')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.maxValue')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.weight')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.price')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.tracking')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {CustomShippingItems.map((item: any, index: number) => {
                            if (item.range !== 'domestic') return null;
                            return (
                                <TableRow key={`${item.type}-${index}`}>
                                    <TableCell scope='row'>{t(`shipping.${item.type}`)}</TableCell>
                                    <TableCell align='right'>{item.cards}</TableCell>
                                    <TableCell align='right'>{item.maxValue}</TableCell>
                                    <TableCell align='right'>{item.weight}</TableCell>
                                    <TableCell align='right'>{formatCurrency(item.price)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(item.tracking)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant='body1' component={'h3'} sx={{ mt: 1, fontWeight: 'bold' }}>
                {t(`shipping.international`)}
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('shipping.form.type')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.cards')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.maxValue')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.weight')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.price')}</TableCell>
                            <TableCell align='right'>{t('shipping.form.tracking')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {CustomShippingItems.map((item: any, index: number) => {
                            if (item.range !== 'international') return null;
                            return (
                                <TableRow key={`${item.type}-${index}`}>
                                    <TableCell scope='row'>{t(`shipping.${item.type}`)}</TableCell>
                                    <TableCell align='right'>{item.cards}</TableCell>
                                    <TableCell align='right'>{item.maxValue}</TableCell>
                                    <TableCell align='right'>{item.weight}</TableCell>
                                    <TableCell align='right'>{formatCurrency(item.price)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(item.tracking)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Formik
                initialValues={{
                    range: 'domestic',
                    type: 'letter',
                    cards: 0,
                    maxValue: 0,
                    weight: 0,
                    price: 0,
                    tracking: 0,
                }}
                onSubmit={(values) => {
                    addCustomShippingItem(values);
                }}
                validationSchema={Yup.object({
                    range: Yup.string().required(t('errors.required')),
                    type: Yup.string().required(t('errors.required')),
                    cards: Yup.number(),
                    maxValue: Yup.number(),
                    weight: Yup.number(),
                    price: Yup.number(),
                    tracking: Yup.number(),
                })}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 4 }}>
                            <Grid size={12}>
                                <TextField
                                    label={t('shipping.form.range')}
                                    name='range'
                                    select
                                    value={values.range}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.range && Boolean(errors.range)}
                                    helperText={touched.range && errors.range}
                                    fullWidth
                                >
                                    <MenuItem value='domestic'>{t('shipping.domestic')}</MenuItem>
                                    <MenuItem value='international'>{t('shipping.international')}</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.type')}
                                    name='type'
                                    select
                                    value={values.type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.type && Boolean(errors.type)}
                                    fullWidth
                                >
                                    <MenuItem value='letter'>{t('shipping.letter')}</MenuItem>
                                    <MenuItem value='package'>{t('shipping.package')}</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.cards')}
                                    name='cards'
                                    type='number'
                                    value={values.cards}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.cards && Boolean(errors.cards)}
                                    helperText={touched.cards && errors.cards}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.maxValue')}
                                    name='maxValue'
                                    type='number'
                                    value={values.maxValue}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.maxValue && Boolean(errors.maxValue)}
                                    helperText={touched.maxValue && errors.maxValue}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.weight')}
                                    name='weight'
                                    type='number'
                                    value={values.weight}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.weight && Boolean(errors.weight)}
                                    helperText={touched.weight && errors.weight}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.price')}
                                    name='price'
                                    type='number'
                                    value={values.price}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.price && Boolean(errors.price)}
                                    helperText={touched.price && errors.price}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label={t('shipping.form.tracking')}
                                    name='tracking'
                                    type='number'
                                    value={values.tracking}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.tracking && Boolean(errors.tracking)}
                                    helperText={touched.tracking && errors.tracking}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Button type='submit' variant='contained' color='primary' sx={{ my: 2, float: 'right' }}>
                            {t('shipping.form.add')}
                        </Button>
                    </form>
                )}
            </Formik>
        </Card>
    );
};

export default ShippingRatesTableCustom;
