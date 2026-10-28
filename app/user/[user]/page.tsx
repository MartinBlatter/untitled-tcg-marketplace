'use client';

import CategoryCards from '@/src/components/CategoryCards/CategoryCards';
import SendMessageDialog from '@/src/components/SendMessageDialog/SendMessageDialog';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { PersonOff, Send } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { use } from 'react';

export default function PublicProfile(props: { params: Promise<{ user: string }> }) {
    const t = useTranslations();
    const notifications = useNotifications();
    const params = use(props.params);
    const user = params.user;
    const { data: session } = useSession();
    const [loading, setLoading] = React.useState(true);
    const [userData, setUserData] = React.useState<any>(null);
    const [businessData, setBusinessData] = React.useState<any>(null);
    const [categoryData, setCategoryData] = React.useState<any>([]);
    const [showSendMessageDialog, setShowSendMessageDialog] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/profile/public/${encodeURI(user as string)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUserData(data.user);
                    setBusinessData(data.company);
                    const categories = [];
                    if (data.categories && Array.isArray(data.categories)) {
                        data.categories.forEach((category: any, index: number) => {
                            categories.push({
                                id: index,
                                name: category.type,
                                user: data.user.userName,
                                imageUrl: `${INTERNAL_ROUTES.MAGIC.PRODUCTS_BY_CATEGORY(category.type)}.png`,
                            });
                        });
                    }
                    if (data.categories && !Array.isArray(data.categories)) {
                        categories.push({
                            id: 0,
                            name: data.categories.type,
                            user: data.user.userName,
                            imageUrl: `${INTERNAL_ROUTES.MAGIC.PRODUCTS_BY_CATEGORY(data.categories.type)}.png`,
                        });
                    }
                    setCategoryData(categories);
                } else {
                    notifications.addErrorNotification(t('profile.errorNotFound'));
                }
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {loading && <LinearProgress sx={{ mt: 5 }} />}
            {!loading && !userData && (
                <Alert severity='error' sx={{ mt: 5 }}>
                    {t('profile.errorNotFound')}
                </Alert>
            )}
            {!loading && userData && (
                <>
                    {businessData && businessData.banner && (
                        <Box
                            sx={{
                                width: '100%',
                                height: 500,
                                position: 'absolute',
                                zIndex: -1,
                                backgroundImage: `url(${businessData.banner})`,
                                left: 0,
                                top: 64,
                                backgroundSize: 'cover',
                            }}
                        />
                    )}
                    <Card>
                        <CardContent>
                            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                                {user}
                            </Typography>
                            <Typography variant='h5' component={'p'}>
                                <span>{businessData && businessData.name ? `${t('profile.type.business')}: ${businessData.name}` : t('profile.type.private')} </span> -{' '}
                                <span>
                                    <Box
                                        component='img'
                                        sx={{
                                            height: 16,
                                        }}
                                        alt={t(`localeStrings.${userData.country.toLowerCase()}`)}
                                        src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${userData.country.toLowerCase()}.gif`}
                                    />
                                </span>{' '}
                                - <span>{userData.firstName}</span>
                            </Typography>
                            <Grid
                                container
                                spacing={4}
                                style={{
                                    marginTop: '20px',
                                    justifyContent: 'center',
                                }}
                            >
                                <Grid
                                    size={{ xs: 12, md: 3 }}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {businessData && businessData.avatar ? (
                                        <Image
                                            src={businessData.avatar}
                                            alt='avatar'
                                            width={250}
                                            height={250}
                                            style={{
                                                width: 'auto',
                                                maxWidth: '250px',
                                                height: 'auto',
                                                maxHeight: '250px',
                                            }}
                                        />
                                    ) : (
                                        <Avatar variant='square' sx={{ width: 250, height: 250 }} />
                                    )}
                                </Grid>
                                <Grid
                                    size={{ xs: 12, md: 3 }}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Card sx={{ width: '100%' }}>
                                        <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                                            ToDo: Ratings
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid
                                    size={{ xs: 12, md: 3 }}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Card sx={{ width: '100%' }}>
                                        <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                                            ToDo: Purchases
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid
                                    size={{ xs: 12, md: 3 }}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Card sx={{ width: '100%' }}>
                                        <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                                            ToDo: Sales
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                            {session && (
                                <Grid
                                    container
                                    spacing={4}
                                    style={{
                                        marginTop: '20px',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Grid
                                        size={{ xs: 12, md: 6 }}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Button fullWidth startIcon={<Send />} variant='outlined' onClick={() => setShowSendMessageDialog(true)}>
                                            {t('profile.sendMessage')}
                                        </Button>
                                    </Grid>
                                    <Grid
                                        size={{ xs: 12, md: 6 }}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Button fullWidth startIcon={<PersonOff />} variant='outlined'>
                                            {t('profile.blockUser')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                    {categoryData && categoryData.length > 0 && (
                        <Grid container spacing={4} style={{ marginTop: 20 }}>
                            <CategoryCards categories={categoryData} />
                        </Grid>
                    )}
                    {showSendMessageDialog && <SendMessageDialog open={showSendMessageDialog} handleClose={() => setShowSendMessageDialog(false)} userId={userData.id} userName={user} />}
                </>
            )}
        </>
    );
}
