'use client';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Collapse, Divider, Drawer, IconButton, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React from 'react';
import { firstList, fourthList, secondList, thirdList } from './SideNavLists';

export default function SideNav() {
    const [open, setOpen] = React.useState(false);
    const t = useTranslations();
    const { data: session } = useSession();
    const [openSection, setOpenSection] = React.useState('');

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleListItemClick = (e: React.MouseEvent<HTMLDivElement>, text: string) => {
        setOpenSection((prev) => (prev === text ? '' : text));
        e.stopPropagation();
    };

    return (
        <>
            <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
                <MenuIcon />
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role='presentation' onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    <List>
                        {firstList.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <Link underline='none' href={`${item.url}`} sx={{ width: '100%' }}>
                                    <ListItemButton>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={t(`sidenav.${item.text}`)} />
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    {session && (
                        <>
                            <List>
                                {secondList.map((item) => (
                                    <React.Fragment key={item.text}>
                                        {item.nestedList ? (
                                            <>
                                                <ListItemButton onClick={(e) => handleListItemClick(e, item.text)}>
                                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                                    <ListItemText primary={t(`sidenav.${item.text}`)} sx={{ color: 'primary.main' }} />
                                                    {openSection === item.text ? <ExpandLess /> : <ExpandMore />}
                                                </ListItemButton>
                                                <Collapse in={openSection === item.text} timeout='auto' unmountOnExit>
                                                    <List component='div' disablePadding>
                                                        {item.nestedList.map((nestedItem) => (
                                                            <ListItem key={nestedItem.text} disablePadding>
                                                                <Link underline='none' href={nestedItem.url} sx={{ width: '100%' }}>
                                                                    <ListItemButton>
                                                                        <ListItemText primary={t(`sidenav.${nestedItem.text}`)} sx={{ pl: 7 }} />
                                                                    </ListItemButton>
                                                                </Link>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </>
                                        ) : (
                                            <ListItem disablePadding>
                                                <Link underline='none' href={item.url} sx={{ width: '100%' }}>
                                                    <ListItemButton>
                                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                                        <ListItemText primary={t(`sidenav.${item.text}`)} />
                                                    </ListItemButton>
                                                </Link>
                                            </ListItem>
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                            <Divider />
                            <List>
                                {thirdList.map((item) => (
                                    <React.Fragment key={item.text}>
                                        {item.nestedList ? (
                                            <>
                                                <ListItemButton onClick={(e) => handleListItemClick(e, item.text)}>
                                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                                    <ListItemText primary={t(`sidenav.${item.text}`)} sx={{ color: 'primary.main' }} />
                                                    {openSection === item.text ? <ExpandLess /> : <ExpandMore />}
                                                </ListItemButton>
                                                <Collapse in={openSection === item.text} timeout='auto' unmountOnExit>
                                                    <List component='div' disablePadding>
                                                        {item.nestedList.map((nestedItem) => (
                                                            <ListItem key={nestedItem.text} disablePadding>
                                                                <Link underline='none' href={nestedItem.url} sx={{ width: '100%' }}>
                                                                    <ListItemButton>
                                                                        <ListItemText primary={t(`sidenav.${nestedItem.text}`)} sx={{ pl: 7 }} />
                                                                    </ListItemButton>
                                                                </Link>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </>
                                        ) : (
                                            <ListItem disablePadding>
                                                <Link underline='none' href={item.url} sx={{ width: '100%' }}>
                                                    <ListItemButton>
                                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                                        <ListItemText primary={t(`sidenav.${item.text}`)} />
                                                    </ListItemButton>
                                                </Link>
                                            </ListItem>
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                            <Divider />
                            <List>
                                {fourthList.map((item) => (
                                    <ListItem key={item.text} disablePadding>
                                        <Link underline='none' href={`${item.url}`} sx={{ width: '100%' }}>
                                            <ListItemButton>
                                                <ListItemIcon>{item.icon}</ListItemIcon>
                                                <ListItemText primary={t(`sidenav.${item.text}`)} />
                                            </ListItemButton>
                                        </Link>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
