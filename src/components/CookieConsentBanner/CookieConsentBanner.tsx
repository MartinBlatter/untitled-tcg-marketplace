"use client";
import React from "react";
import { useTranslations } from "next-intl";
import {
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
} from "@mui/material";
import { Cookie } from "@mui/icons-material";
import { getCookieConsent, setCookieConsent } from "@/src/utils/cookies.helper";

const CookieConsentBanner = () => {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        getCookieConsent().then((res) => {
            if (res === null) {
                setOpen(true);
            }
        });
    });

    const acceptAllCookies = () => {
        setOpen(false);
        setCookieConsent("accepted");
    };

    const acceptNeededCookies = () => {
        setOpen(false);
        setCookieConsent("needed");
    };

    return (
        <Drawer open={open} anchor="bottom" sx={{ zIndex: 9999 }}>
            <Box
                sx={{
                    margin: "0 auto",
                    maxWidth: "1200px",
                    width: "100%",
                    py: 2,
                    zIndex: 9999,
                }}
            >
                <Typography variant="h5" component="h1">
                    {t("cookieconsent.title")}
                </Typography>
                <Typography variant="body1">{t("cookieconsent.p1")}</Typography>
                <Typography variant="body1">{t("cookieconsent.p2")}</Typography>
                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <Cookie />
                        </ListItemIcon>
                        <ListItemText primary={t("cookieconsent.li1")} />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Cookie />
                        </ListItemIcon>
                        <ListItemText primary={t("cookieconsent.li2")} />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Cookie />
                        </ListItemIcon>
                        <ListItemText primary={t("cookieconsent.li3")} />
                    </ListItem>
                </List>
                <Typography variant="body1">{t("cookieconsent.p3")}</Typography>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => acceptNeededCookies()}
                    >
                        {t("cookieconsent.button.acceptNeeded")}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => acceptAllCookies()}
                    >
                        {t("cookieconsent.button.acceptAll")}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default CookieConsentBanner;
