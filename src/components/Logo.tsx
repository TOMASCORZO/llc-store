import Image from 'next/image';
import wordmark from '../../public/brand/logo.png';

interface LogoProps {
    size?: number;
}

export default function Logo({ size = 20 }: LogoProps) {
    const height = size * 2;

    return (
        <Image
            src={wordmark}
            alt="Just My LLC"
            width={Math.round(height * wordmark.width / wordmark.height)}
            height={height}
            style={{ display: 'block', width: 'auto', height, maxWidth: '100%', objectFit: 'contain' }}
        />
    );
}
