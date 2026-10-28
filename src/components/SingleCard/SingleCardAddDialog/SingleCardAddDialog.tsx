import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Grid, FormControlLabel, Checkbox, CircularProgress } from "@mui/material";
import { SingleCardAddDialogProps } from "./types";
import { useTranslations } from "next-intl";
import { Formik } from "formik";
import * as yup from 'yup';
import { languagesEnum } from "@/src/constants/languages";
import { qualitiesEnum } from "@/src/constants/qualities";
import { submitItemAddAction } from "@/src/actions/inventory";
import { useNotifications } from "@/src/lib/context/NotificationProvider";
import { useState } from "react";
import { BrokenImage, Brush, Gesture, GMobiledata, Star } from "@mui/icons-material";

const SingleCardAddDialog = ({ show, setShow, card }: SingleCardAddDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setShow(false);
    };

    const submitItemAdd = (values: any, id: string) => {
        setLoading(true);

        submitItemAddAction(values, id).then((res) => {
            setLoading(false);
            if (res) {
                notifications.addSuccessNotification(t('inventory.successAdd'));
            } else {
                notifications.addErrorNotification(t('inventory.errorAdd'));
            }
        })

        setShow(false);
    };

    const validationSchema = yup.object({
        price: yup.number().required(t('errors.required')).moreThan(0, 'optionYear should not be zero or less than zero'),
        quantity: yup.number().required(t('errors.required')).moreThan(0, 'optionYear should not be zero or less than zero'),
        language: yup.string().required(t('errors.required')),
        quality: yup.string().required(t('errors.required'))
    });

    return (
        <Dialog
            open={show}
            onClose={handleClose}
        >
            <DialogTitle>&quot;{card.foreignName ? card.foreignName : card.name}&quot; {t('products.details.sell')}</DialogTitle>
            <Formik
                initialValues={{
                    price: '0.00',
                    quantity: '1',
                    language: 'en',
                    quality: 'NM',
                    comment: '',
                    internalComment: '',
                    isFoil: false,
                    isAltered: false,
                    isSigned: false,
                    isMisprint: false,
                    dontList: false,
                    isGraded: false,
                    grading: '',
                    gradingCompany: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    submitItemAdd(values, card.uuid);
                }}
            >
                {({
                    values,
                    errors,
                    touched,
                    dirty,
                    handleChange,
                    handleBlur,
                }) => (
                    <form>
                        <DialogContent>
                            <Grid container spacing={4} sx={{
                                marginTop: 1
                            }}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="number"
                                            name="price"
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
                                            type="number"
                                            name="quantity"
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
                                    <FormControl fullWidth>
                                        <InputLabel id="select-language-label">{t('products.singleCard.language')}</InputLabel>
                                        <Select
                                            labelId="select-language-label"
                                            id="select-language"
                                            name="language"
                                            value={values.language}
                                            label={t('products.singleCard.language')}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {languagesEnum.map((language) => (
                                                <MenuItem key={language} value={language}>{t(`localeStrings.${language}`)}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="select-quality-label">{t('products.singleCard.quality')}</InputLabel>
                                        <Select
                                            labelId="select-quality-label"
                                            id="select-quality"
                                            name="quality"
                                            value={values.quality}
                                            label={t('products.singleCard.quality')}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {qualitiesEnum.map((quality) => (
                                                <MenuItem key={quality} value={quality}>{t(`qualityStrings.${quality}`)}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name="isFoil"
                                        control={<Checkbox />}
                                        checked={values.isFoil}
                                        label={<>{t('products.singleCard.foil')} <Star /></>}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name="isSigned"
                                        control={<Checkbox />}
                                        checked={values.isSigned}
                                        label={<>{t('products.singleCard.signed')} <Gesture /></>}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name="isAltered"
                                        control={<Checkbox />}
                                        checked={values.isAltered}
                                        label={<>{t('products.singleCard.altered')} <Brush /></>}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name="isMisprint"
                                        control={<Checkbox />}
                                        checked={values.isMisprint}
                                        label={<>{t('products.singleCard.misprint')} <BrokenImage /></>}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name="isGraded"
                                        control={<Checkbox />}
                                        checked={values.isGraded}
                                        label={<>{t('products.singleCard.graded')} <GMobiledata /></>}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                {values.isGraded && (
                                    <>
                                        <Grid size={{ xs: 6 }}>
                                            <FormControl fullWidth>
                                                <TextField
                                                    type="number"
                                                    name="grading"
                                                    slotProps={{ input: { inputProps: { step: '0.01' } } }}
                                                    label={t('products.singleCard.grading')}
                                                    value={values.grading}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.grading && Boolean(errors.grading)}
                                                    fullWidth
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <FormControl fullWidth>
                                                <TextField
                                                    name="gradingCompany"
                                                    label={t('products.singleCard.gradingCompany')}
                                                    value={values.gradingCompany}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.gradingCompany && Boolean(errors.gradingCompany)}
                                                    fullWidth
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>
                                )}
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="text"
                                            name="comment"
                                            label={t('products.singleCard.comment')}
                                            value={values.comment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.comment && Boolean(errors.comment)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="text"
                                            name="internalComment"
                                            label={t('products.singleCard.internalComment')}
                                            value={values.internalComment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.internalComment && Boolean(errors.internalComment)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        name="dontList"
                                        control={<Checkbox />}
                                        checked={values.dontList}
                                        label={t('products.singleCard.onlyInventory')}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>{t('cancel')}</Button>
                            <Button variant="contained" disabled={loading} onClick={() => submitItemAdd(values, card.uuid)}>{loading ? <CircularProgress size={12} sx={{ marginRight: 1 }} /> : ''} {t('save')}</Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

export default SingleCardAddDialog;