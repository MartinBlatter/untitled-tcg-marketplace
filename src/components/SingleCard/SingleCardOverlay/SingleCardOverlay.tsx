import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { BrokenImage, Brush, ChatBubble, Comment, Gesture, GMobiledata, InsertPhoto, Star } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import CardImageBadge from '../../CardImageBadge/CardImageBadge';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';
import { SingleCardOverlayProps } from './types';

const SingleCardOverlay = ({ card, language }: SingleCardOverlayProps) => {
    const t = useTranslations();
    const displayLanguage = language || card.inventoryLanguage;

    return (
        <Box
            sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                px: 2,
                pt: 2,
                pb: 1,
                textAlign: 'center',
                zIndex: 1,
            }}
        >
            {card.setCode && (
                <Box component='span' sx={{ marginRight: 8 }}>
                    <ImageWithFallback
                        height={20}
                        width={20}
                        className='invert'
                        src={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/${card.setCode.toLowerCase()}.svg`}
                        fallbackSrc={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/fallback.svg`}
                        alt={card.setCode}
                    />
                </Box>
            )}
            {/* Display language based on prop or card data */}
            {displayLanguage && (
                <Tooltip title={t(`localeStrings.${displayLanguage}`)}>
                    <Box component='span' sx={{ marginRight: 1 }}>
                        <Image height={20} width={30} alt={t(`localeStrings.${displayLanguage}`)} src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${displayLanguage}.gif`} />
                    </Box>
                </Tooltip>
            )}
            <Typography component='span' sx={{ color: 'white', ml: 1 }}>
                {card.inventoryQuality || card.quality}
            </Typography>
            {/* Card attribute icons */}
            {(card.inventoryIsFoil || card.isFoil) === 1 && (
                <Tooltip title={t('inventory.inventoryColumns.foil')}>
                    <Star sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {(card.inventoryIsAltered || card.isAltered) === 1 && (
                <Tooltip title={t('inventory.inventoryColumns.altered')}>
                    <Brush sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {(card.inventoryIsSigned || card.isSigned) === 1 && (
                <Tooltip title={t('inventory.inventoryColumns.signed')}>
                    <Gesture sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {(card.inventoryIsMisprint || card.isMisprint) === 1 && (
                <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                    <BrokenImage sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {(card.inventoryIsGraded || card.isGraded) === 1 && (
                <Tooltip title={`${card.inventoryGradingCompany || card.gradingCompany} ${card.inventoryGrading || card.grading}`}>
                    <GMobiledata sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {(card.inventoryComment || (card.comment && card.comment.length)) && (
                <Tooltip title={card.inventoryComment || card.comment}>
                    <Comment sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {card.inventoryInternalComment && (
                <Tooltip title={card.inventoryInternalComment}>
                    <ChatBubble sx={{ color: 'white', ml: 1 }} />
                </Tooltip>
            )}
            {card.inventoryImagePath && (
                <Tooltip title={<CardImageBadge card={card as unknown as CardSet} imagePath={card.inventoryImagePath} />}>
                    <InsertPhoto sx={{ cursor: 'pointer', color: 'white', ml: 1 }} />
                </Tooltip>
            )}
        </Box>
    );
};

export default SingleCardOverlay;
