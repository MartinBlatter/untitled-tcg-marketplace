import { languagesEnum } from '@/src/constants/languages';
import { qualitiesEnum } from '@/src/constants/qualities';
import { Delete, ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog';
import { WishlistMassEditPanelProps } from './types';

export default function WishlistMassEditPanel({ submitMassEdit, handleMassDelete }: WishlistMassEditPanelProps) {
    const t = useTranslations();
    const languageOptions = [{ code: '%', name: t('noMatter') }];
    languagesEnum.map((language) => {
        languageOptions.push({ code: language, name: t(`localeStrings.${language}`) });
    });

    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls='mass-edit-panel-content' id='mass-edit-panel-header'>
                {t('wishlists.single.massEdit')}
            </AccordionSummary>
            <AccordionDetails>
                <Formik
                    initialValues={{
                        price: '',
                        quantity: '',
                        language: '',
                        quality: '',
                        comment: '',
                        isFoil: '',
                        isAltered: '',
                        isSigned: '',
                        isMisprint: '',
                        isGraded: '',
                    }}
                    validationSchema={null}
                    onSubmit={(values) => {
                        submitMassEdit(values);
                    }}
                >
                    {({ values, errors, touched, dirty, handleChange, handleBlur, setFieldValue }) => (
                        <form>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-quality-label'>{t('wishlists.singleCardDialog.quality')}</InputLabel>
                                        <Select
                                            labelId='select-quality-label'
                                            id='select-quality'
                                            name='quality'
                                            value={values.quality}
                                            label={t('wishlists.singleCardDialog.quality')}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {qualitiesEnum.map((quality) => (
                                                <MenuItem key={quality} value={quality}>
                                                    {t(`qualityStrings.${quality}`)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Autocomplete
                                        multiple
                                        id='language'
                                        options={languageOptions}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event: any, newValue: { name: string; code: string }[] | null) => {
                                            setFieldValue('language', newValue);
                                        }}
                                        renderInput={(params) => <TextField {...params} variant='outlined' label={t('products.singleCard.language')} />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-foil-label'>{t('products.singleCard.foil')}</InputLabel>
                                        <Select
                                            labelId='select-foil-label'
                                            id='select-foil'
                                            name='isFoil'
                                            label={t('products.singleCard.foil')}
                                            value={values.isFoil}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value=''>{t('dontChange')}</MenuItem>
                                            <MenuItem value='true'>{t('yes')}</MenuItem>
                                            <MenuItem value='false'>{t('no')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-signed-label'>{t('products.singleCard.signed')}</InputLabel>
                                        <Select
                                            labelId='select-signed-label'
                                            id='select-signed'
                                            name='isSigned'
                                            label={t('products.singleCard.signed')}
                                            value={values.isSigned}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value=''>{t('dontChange')}</MenuItem>
                                            <MenuItem value='true'>{t('yes')}</MenuItem>
                                            <MenuItem value='false'>{t('no')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-altered-label'>{t('products.singleCard.altered')}</InputLabel>
                                        <Select
                                            labelId='select-altered-label'
                                            id='select-altered'
                                            name='isAltered'
                                            label={t('products.singleCard.altered')}
                                            value={values.isAltered}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value=''>{t('dontChange')}</MenuItem>
                                            <MenuItem value='true'>{t('yes')}</MenuItem>
                                            <MenuItem value='false'>{t('no')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-misprint-label'>{t('products.singleCard.misprint')}</InputLabel>
                                        <Select
                                            labelId='select-misprint-label'
                                            id='select-misprint'
                                            name='isMisprint'
                                            label={t('products.singleCard.misprint')}
                                            value={values.isMisprint}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value=''>{t('dontChange')}</MenuItem>
                                            <MenuItem value='true'>{t('yes')}</MenuItem>
                                            <MenuItem value='false'>{t('no')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-graded-label'>{t('products.singleCard.graded')}</InputLabel>
                                        <Select
                                            labelId='select-graded-label'
                                            id='select-graded'
                                            name='isGraded'
                                            label={t('products.singleCard.graded')}
                                            value={values.isGraded}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value=''>{t('dontChange')}</MenuItem>
                                            <MenuItem value='true'>{t('yes')}</MenuItem>
                                            <MenuItem value='false'>{t('no')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='text'
                                            name='comment'
                                            label={t('products.singleCard.comment')}
                                            value={values.comment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.comment && Boolean(errors.comment)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='number'
                                            name='price'
                                            label={t('products.singleCard.price')}
                                            slotProps={{ input: { inputProps: { step: '0.01' } } }}
                                            value={values.price}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.price && Boolean(errors.price)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='number'
                                            name='quantity'
                                            label={t('products.singleCard.quantity')}
                                            value={values.quantity}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.quantity && Boolean(errors.quantity)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <ConfirmationDialog title={t('inventory.icons.delete')} description={t('confirmation.delete')} response={() => handleMassDelete()}>
                                        {(showDialog) => (
                                            <Button variant='outlined' startIcon={<Delete />} onClick={showDialog}>
                                                {t('wishlists.single.massDelete')}
                                            </Button>
                                        )}
                                    </ConfirmationDialog>
                                    <ConfirmationDialog title={t('wishlists.single.massEdit')} description={t('confirmation.edit')} response={() => submitMassEdit(values)}>
                                        {(showDialog) => (
                                            <Button variant='contained' sx={{ float: 'right' }} disabled={!dirty} onClick={showDialog}>
                                                {t('wishlists.single.massEdit')} {t('save')}
                                            </Button>
                                        )}
                                    </ConfirmationDialog>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Formik>
            </AccordionDetails>
        </Accordion>
    );
}
