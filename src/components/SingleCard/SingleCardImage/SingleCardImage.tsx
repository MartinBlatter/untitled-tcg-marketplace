import CardImageBadge from '../../CardImageBadge/CardImageBadge';
import SingleCardOverlay from '../SingleCardOverlay/SingleCardOverlay';
import { SingleCardImageProps } from './types';

const SingleCardImage = ({ card, showOverlay = false, language }: SingleCardImageProps) => {
    return (
        <>
            {showOverlay && <SingleCardOverlay card={card} language={language} />}
            <CardImageBadge card={card} width={264} height={380} />
        </>
    );
};

export default SingleCardImage;
