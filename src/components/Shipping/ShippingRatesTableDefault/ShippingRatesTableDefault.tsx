import { useShippingStore } from '@/src/store/shipping';
import { formatCurrency } from '@/src/utils/helpers';
import { Check, Close } from '@mui/icons-material';
import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const ShippingRatesTableDefault = () => {
    const t = useTranslations();
    const { usesCustom, defaultShippingMap } = useShippingStore();

    return (
        <Card sx={{ p: 2, position: 'relative', border: usesCustom ? 'none' : '1px solid', borderColor: usesCustom ? '' : 'success.light' }}>
            <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                {!usesCustom ? <Check sx={{ height: '1.2rem', width: '1.2rem', mr: 1 }} /> : <Close sx={{ height: '1.2rem', width: '1.2rem', mr: 1 }} />} {t(`shipping.defaultShipping`)}
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
                        {Object.keys(defaultShippingMap.domestic.letter).map((key) => (
                            <TableRow key={`default-domestic-letter-${key}`}>
                                <TableCell scope='row'>{t('shipping.letter')}</TableCell>
                                <TableCell align='right'>{Math.floor(((key as unknown as number) - 12) / 2.5)}</TableCell>
                                <TableCell align='right'>99,99 €</TableCell>
                                <TableCell align='right'>{key} g</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.domestic.letter[key as keyof typeof defaultShippingMap.domestic.letter] / 100)}</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.domestic.tracking / 100)}</TableCell>
                            </TableRow>
                        ))}
                        {Object.keys(defaultShippingMap.domestic.package).map((key) => (
                            <TableRow key={`default-domestic-package-${key}`}>
                                <TableCell scope='row'>{t('shipping.package')}</TableCell>
                                <TableCell align='right'></TableCell>
                                <TableCell align='right'></TableCell>
                                <TableCell align='right'>{key} g</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.domestic.package[key as keyof typeof defaultShippingMap.domestic.package] / 100)}</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.domestic.tracking / 100)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant='body1' component={'h3'} sx={{ mt: 2, fontWeight: 'bold' }}>
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
                        {Object.keys(defaultShippingMap.international.letter).map((key) => (
                            <TableRow key={`default-international-letter-${key}`}>
                                <TableCell scope='row'>{t('shipping.letter')}</TableCell>
                                <TableCell align='right'>{Math.floor(((key as unknown as number) - 12) / 2.5)}</TableCell>
                                <TableCell align='right'>99,99 €</TableCell>
                                <TableCell align='right'>{key} g</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.international.letter[key as keyof typeof defaultShippingMap.international.letter] / 100)}</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.international.tracking / 100)}</TableCell>
                            </TableRow>
                        ))}
                        {Object.keys(defaultShippingMap.international.package).map((key) => (
                            <TableRow key={`default-international-package-${key}`}>
                                <TableCell scope='row'>{t('shipping.package')}</TableCell>
                                <TableCell align='right'></TableCell>
                                <TableCell align='right'></TableCell>
                                <TableCell align='right'>{key} g</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.international.package[key as keyof typeof defaultShippingMap.international.package] / 100)}</TableCell>
                                <TableCell align='right'>{formatCurrency(defaultShippingMap.international.tracking / 100)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default ShippingRatesTableDefault;
