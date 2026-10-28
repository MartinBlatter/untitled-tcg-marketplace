'use client';

import { submitSendMessageAction } from '@/src/actions/messages';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useMessageStore } from '@/src/store/messages';
import { Conversation } from '@/src/store/types';
import { Feedback } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    Grid,
    LinearProgress,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Pagination,
    Skeleton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { Formik } from 'formik';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React from 'react';
import * as yup from 'yup';

export default function Messages() {
    const { loading, conversations, refresh, selectedConversation, setSelectedConversation, refreshWithoutLoading, setConversationRead, page, size, setPage, count, conversationsLoading } =
        useMessageStore();
    const t = useTranslations();
    const theme = useTheme();
    const { data: session } = useSession();
    const notifications = useNotifications();

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        if (conversation.unread) {
            setConversationRead(conversation);
        }
    };

    const validationSchema = yup.object({
        title: yup.string().required(t('errors.required')),
        message: yup.string().required(t('errors.required')),
    });

    const submitSendMessage = (values: { title: string; message: string }, userId: number) => {
        submitSendMessageAction(values, userId).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('messages.successSend'));
                refreshWithoutLoading();
            } else {
                notifications.addErrorNotification(t('messages.errorSend'));
            }
        });
    };

    React.useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`messages.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t('messages.title')}
            </Typography>
            {loading && <LinearProgress sx={{ mt: 5 }} />}
            {!loading && conversations && conversations.length === 0 && (
                <Alert severity='error' sx={{ mt: 5 }}>
                    {t('messages.errorNotFound')}
                </Alert>
            )}
            {!loading && conversations && conversations.length > 0 && (
                <Grid container spacing={0} component={Card} style={{ marginTop: '2rem', justifyContent: 'center' }}>
                    {/* Left Panel: Message List */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <List sx={{ p: 0, width: '100%' }}>
                            <Pagination count={Math.ceil(count / size)} page={page} onChange={(e, page) => setPage(page)} size='small' sx={{ py: 1 }} />
                            {conversationsLoading &&
                                (() => {
                                    const placeholders: any[] = [];
                                    for (let i = 0; i <= size; i++) {
                                        placeholders.push(
                                            <React.Fragment key={`skeleton-${i}`}>
                                                <ListItemButton>
                                                    <ListItemText
                                                        primary={<Skeleton sx={{ width: '100%' }} variant='rectangular' />}
                                                        secondary={<Skeleton sx={{ width: '100%' }} variant='rectangular' />}
                                                    />
                                                </ListItemButton>
                                                <Divider />
                                            </React.Fragment>
                                        );
                                    }
                                    return placeholders;
                                })()}
                            {!conversationsLoading &&
                                conversations.map((conversation: Conversation, index: number) => (
                                    <React.Fragment key={`conversaion-${index}`}>
                                        <ListItemButton
                                            onClick={() => handleSelectConversation(conversation)}
                                            sx={{
                                                backgroundColor: conversation.userId === selectedConversation?.userId ? theme.palette.primary.light : 'inherit',
                                            }}
                                        >
                                            {conversation.unread && (
                                                <ListItemIcon>
                                                    <Feedback />
                                                </ListItemIcon>
                                            )}
                                            <ListItemText primary={conversation.userName} secondary={`${new Date(conversation.messages[0].createdAt).toLocaleString()}`} />
                                        </ListItemButton>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                        </List>
                        <Divider orientation='vertical' flexItem />
                    </Grid>

                    {/* Right Panel: Message Details */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ pt: 2, position: 'relative' }}>
                        <Box sx={{ minHeight: '500px', maxHeight: 'calc(100vh - 550px)', overflowY: 'auto' }}>
                            {selectedConversation &&
                                selectedConversation.messages.map((message, index) => (
                                    <React.Fragment key={`message-${index}`}>
                                        <Card
                                            sx={{
                                                width: '80%',
                                                p: 2,
                                                ml: message.senderId === selectedConversation.userId ? '2%' : '18%',
                                                backgroundColor: message.senderId === selectedConversation.userId ? 'inherit' : theme.palette.action.hover,
                                            }}
                                        >
                                            <Typography variant='h6' component={'div'} sx={{
                                                color: 'text.secondary'
                                            }}>
                                                {message.title}
                                            </Typography>
                                            <Typography variant='body1' component={'div'}>
                                                {message.text}
                                            </Typography>
                                        </Card>
                                        <Typography
                                            variant='caption'
                                            component={'div'}
                                            sx={{
                                                color: 'text.secondary',
                                                mt: 1,
                                                width: '80%',
                                                mb: 2,
                                                px: '1%',
                                                ml: message.senderId === selectedConversation.userId ? '2%' : '18%',
                                                textAlign: message.senderId === selectedConversation.userId ? 'left' : 'right',
                                            }}
                                        >
                                            {new Date(message.createdAt).toLocaleString()}
                                        </Typography>
                                    </React.Fragment>
                                ))}
                            {!selectedConversation && (
                                <Typography
                                    variant='h6'
                                    sx={{
                                        color: 'text.secondary',
                                        textAlign: 'center',
                                        mt: 5,
                                        width: '100%'
                                    }}>
                                    {t('messages.selectMessage')}
                                </Typography>
                            )}
                        </Box>
                        {selectedConversation && (
                            <Grid>
                                <Formik
                                    initialValues={{
                                        title: '',
                                        message: '',
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={(values) => {
                                        submitSendMessage(values, selectedConversation.userId);
                                    }}
                                >
                                    {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                                        <form>
                                            <Divider />
                                            <Grid
                                                container
                                                spacing={1}
                                                sx={{
                                                    marginTop: 1,
                                                    px: 2,
                                                    pb: 1
                                                }}>
                                                <Grid size={12}>
                                                    <FormControl fullWidth>
                                                        <TextField
                                                            id='title'
                                                            name='title'
                                                            label={t('messages.dialog.field.title')}
                                                            fullWidth
                                                            variant='outlined'
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
                                                            id='message'
                                                            name='message'
                                                            label={t('messages.dialog.field.message')}
                                                            fullWidth
                                                            multiline
                                                            rows={3}
                                                            variant='outlined'
                                                            value={values.message}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.message && Boolean(errors.message)}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        variant='contained'
                                                        disabled={!dirty || !values.title || !values.message}
                                                        onClick={() => submitSendMessage(values, selectedConversation.userId)}
                                                    >
                                                        {t('send')}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    )}
                                </Formik>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            )}
        </>
    );
}
