import { OG_FONT } from '../constants';
import { backgroundImage } from './backgroundImage';

interface Props {
  userCount: string;
}

export const OgImage = ({ userCount }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        fontFamily: OG_FONT,
        background: '#160f29',
        fontWeight: 900,
      }}
    >
      <img
        src={backgroundImage}
        width="100"
        height="100"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          color: '#ffffff',
          paddingTop: '220px',
          paddingLeft: '65px',
          paddingBottom: '80px',
          height: '100vh',
          width: '100vw',
          gap: '20px',
          textShadow: '5px 5px 6px rgba(0, 0, 0, 0.8)',
        }}
      >
        <p
          style={{
            fontSize: '240px',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'baseline',
            gap: '20px',
          }}
        >
          {Number(userCount).toLocaleString()}
        </p>
        <p style={{ fontSize: '60px' }}>
          Bluesky<span style={{ marginLeft: '20px' }} />
          users<span style={{ marginLeft: '20px' }} />
          found<span style={{ marginLeft: '20px' }} />
          in<span style={{ marginLeft: '20px' }} />
          my<span style={{ marginLeft: '20px' }} />
          network.
        </p>
      </div>
    </div>
  );
};
