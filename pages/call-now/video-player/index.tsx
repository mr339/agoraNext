import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

const VideoPlayer = ({ user, users, channelParameters }: any) => {
    const ref: any = useRef();
    const router = useRouter();


    useEffect(() => {
        if (user?.videoTrack) {
            user.videoTrack.play(ref.current);
        }
    }, []);


    if (user?.videoTrack) {
        return (
            <div className="col" style={{
                width: '100%',
                height: '100%',
            }}>
                <div
                    ref={ref}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                ></div>
            </div>
        );
    }
    return null;
};

export default VideoPlayer;
