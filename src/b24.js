

export default class B24 {
    async monitor () {
        const users = await BX24API.callMethod('user.get', { 'FILTER': { 'UF_DEPARTMENT': 5, 'ACTIVE': true } })

        console.log(users)
        /*
        let monitor = { }
        users.result.forEach((res) => {

            console.log(res)

            monitor.users.id = res.ID;
            monitor.users.name = res.NAME;
            monitor.users.last_name = res.LAST_NAME;

        })

        const call = await BX24API.getAll('voximplant.statistic.get',
            {'FILTER': { '>=CALL_DURATION': 30, 'CALL_TYPE': 1, 'PORTAL_USER_ID': 30, '>CALL_START_DATE': '2022-07-08 00:00:00', '<CALL_START_DATE': '2022-07-08 23:59:59'}})
        console.log(call)
        monitor.users.callCount = call.result

        console.log(monitor)
        return monitor;

         */
    }
}
