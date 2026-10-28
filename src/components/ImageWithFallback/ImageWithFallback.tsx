import Image from "next/image";
import { useEffect, useState } from "react";

const ImageWithFallback = ({
    fallbackSrc,
    src,
    height,
    width,
    className,
    alt,
    ...props
}: { fallbackSrc: string, src: string, height: number, width: number, className: string, alt?: string, props?: any }) => {
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        setError(null);
    }, [src]);

    if (!(props as any).alt) {
        (props as any).alt = 'Fallback Image'
    }

    if (!alt) {
        alt = 'Fallback Image'
    }

    return (
        <Image
            onError={setError}
            src={error ? fallbackSrc : src}
            height={height}
            width={width}
            className={className}
            alt={alt}
            {...props}
        />
    );
}

export default ImageWithFallback;