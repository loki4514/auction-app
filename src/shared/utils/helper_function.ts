import moment from 'moment-timezone';

export const getISTDate = (): Date => {
    return moment().tz('Asia/Kolkata').toDate();
};