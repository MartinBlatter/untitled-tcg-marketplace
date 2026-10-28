import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, Grid, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { SendMessageDialogProps } from "./types";
import { Formik } from "formik";
import * as yup from 'yup';
import React from "react";
import { useNotifications } from "@/src/lib/context/NotificationProvider";
import { submitSendMessageAction } from "@/src/actions/messages";

export default function SendMessageDialog({ open, handleClose, userName, userId }: SendMessageDialogProps) {
    const t = useTranslations();
    const [loading, setLoading] = React.useState(false);
    const notifications = useNotifications();

    const submitSendMessage = (values: { title: string, message: string }, userId: number) => {
        setLoading(true);

        submitSendMessageAction(values, userId).then((res) => {
            setLoading(false);
            if (res) {
                notifications.addSuccessNotification(t('messages.successSend'));
            } else {
                notifications.addErrorNotification(t('messages.errorSend'));
            }
            handleClose();
        })
    }

    const validationSchema = yup.object({
        title: yup.string().required(t('errors.required')),
        message: yup.string().required(t('errors.required'))
    });

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            sx={{ minWidth: '400px' }}
        >
            <DialogTitle>{t('messages.dialog.title', { 'user': userName })}</DialogTitle>
            <Formik
                initialValues={{
                    title: '',
                    message: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    submitSendMessage(values, userId);
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
                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="title"
                                            name="title"
                                            label={t('messages.dialog.field.title')}
                                            fullWidth
                                            variant="outlined"
                                            value={values.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.title && Boolean(errors.title)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="message"
                                            name="message"
                                            label={t('messages.dialog.field.message')}
                                            fullWidth
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            value={values.message}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.message && Boolean(errors.message)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>{t('close')}</Button>
                            <Button variant="contained" disabled={!dirty || !values.title || !values.message} onClick={() => submitSendMessage(values, userId)}>{loading ? <CircularProgress size={12} sx={{ ml: 1 }} /> : ''}{t('send')}</Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
}