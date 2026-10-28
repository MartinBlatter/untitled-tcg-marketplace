import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { getImageHint } from '@/src/utils/helpers';
import { Badge } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface CardImageBadgeProps {
    card: CardSet;
    width?: number;
    height?: number;
    imagePath?: string;
}

const CardImageBadge = ({ card, width = 280, height = 400, imagePath }: CardImageBadgeProps) => {
    const t = useTranslations();
    const hint = getImageHint(card);

    const finalImagePath = imagePath ? imagePath : `${process.env.NEXT_PUBLIC_IMAGE_HOST}/magic/cards/${card.uuid}.jpg`;

    if (hint === null) {
        return (
            <Image
                style={{
                    marginTop: '5px',
                }}
                src={finalImagePath}
                width={width}
                height={height}
                alt={`Picture of Card ${card.name}`}
            />
        );
    }
    return (
        <Badge className='single-badge' color='primary' badgeContent={t(hint)}>
            <Image
                style={{
                    marginTop: '5px',
                }}
                src={finalImagePath}
                width={width}
                height={height}
                alt={`Picture of Card ${card.name}`}
            />
        </Badge>
    );
};

export default CardImageBadge;
