'use client';
import { Box } from '@mui/material';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';

const Carousel = () => {
    const options = {
        type: 'loop',
        gap: '1rem',
        autoplay: true,
        pauseOnHover: false,
        resetProgress: false,
        height: '15rem',
    };

    // Original placeholder artwork, drawn for this project and shipped from
    // /public. Deliberately not Wizards of the Coast art: that carries a licence
    // this repository cannot grant, which is why the banners used to be fetched
    // from an external host rather than committed.
    //
    // Local and same-origin means no NEXT_PUBLIC_IMAGE_HOST dependency and no
    // mixed-content block on https, which is what broke the previous banners on
    // the deployed site while card art kept working. Card art still comes from
    // the remote host; only these three are ours.
    //
    // They are SVG, so next/image skips optimisation automatically (it does that
    // for any `.svg` src) and serves the file as-is. That is what we want here:
    // vectors rescale losslessly, and all three together are a few kB.
    const slides = [{ id: '1' }, { id: '2' }, { id: '3' }];

    return (
        <Splide options={options} aria-labelledby='autoplay-example-heading' hasTrack={false}>
            <div style={{ position: 'relative' }}>
                <SplideTrack>
                    {slides.map((slide, index) => (
                        <SplideSlide key={`banner-${slide.id}`}>
                            {/* `fill` needs a positioned parent; the 500px keeps the
                                height the homepage already offsets its content by. */}
                            <Box sx={{ position: 'relative', width: '100%', height: '500px' }}>
                                <Image
                                    src={`/banners/${slide.id}.svg`}
                                    alt=''
                                    aria-hidden
                                    fill
                                    sizes='100vw'
                                    // Eager for all three: a slide that autoplays in
                                    // after two seconds is never "below the fold", so
                                    // lazy loading just shows a gap. `priority` is
                                    // deprecated in Next 16.
                                    loading='eager'
                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                    style={{ objectFit: 'cover' }}
                                />
                            </Box>
                        </SplideSlide>
                    ))}
                </SplideTrack>
            </div>

            <div className='splide__progress'>
                <div className='splide__progress__bar' />
            </div>
        </Splide>
    );
};

export default Carousel;
