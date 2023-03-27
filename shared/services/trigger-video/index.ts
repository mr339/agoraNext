import axiosInstance from '@shared/axios';


export const triggerVideo: any = async (type: string, customer_id: string, consultation_id: string) => {
    try {
        const response = await axiosInstance.post(`/trigger-video-call/${customer_id}/${type}?id=${consultation_id}`, {})
        if (response.status === 200) {
            return [response, null];
        } else {
            return [null, null];
        }
    } catch (err: any) {
        if (err.status === 401)
            console.log('401')
        if (err.status === 500)
            console.log('500')
        return [null, err];
    }
};
