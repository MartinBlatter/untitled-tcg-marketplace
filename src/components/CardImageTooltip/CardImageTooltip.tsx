import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import React from 'react';
import CardImageBadge from '../CardImageBadge/CardImageBadge';

interface CardImageTooltipProps {
    card: CardSet;
    iconProps?: React.ComponentProps<typeof CameraAltIcon>;
}

const CardImageTooltip = ({ card, iconProps = { sx: { cursor: 'pointer' } } }: CardImageTooltipProps) => {
    return (
        <Tooltip
            title={
                <React.Fragment>
                    <CardImageBadge card={card} />
                </React.Fragment>
            }
        >
            <CameraAltIcon {...iconProps} />
        </Tooltip>
    );
};

export default CardImageTooltip;
