<template>
  <div id="app">
    <table class="table table-striped table-dark">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Имя менеджера</th>
        <th scope="col">Кол-во звонков</th>
        <th scope="col">Кол-во времени</th>
        <th scope="col">Кол-во Сделок</th>
        <th scope="col">Счета/День</th>
        <th scope="col">ЦКП/День</th>
        <th scope="col">ЦКП/Неделя</th>
      </tr>
      </thead>
      <tbody>
        <tr v-if = 'isLoad === true' v-for="(tableData, index) in tableDatas" :key="tableDatas.id">
          <td>
            <div class="avatars avatar">
              <img :src="tableData.photo" alt="">
            </div>
          </td>
          <td>
            {{tableData.name+' '+tableData.last_name}}
          </td>
          <td>
            {{tableData.callCount}}
          </td>
          <td>
            {{tableData.callTime}}
          </td>
          <td>
            {{tableData.dealCount}}
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import BX24API from './bx24';
export default {
  name: 'App',
  components: {},
  data () {
    return {
      isLoad: false,
      leads: [],
      tableDatas: {}
    }
  },
  created() {
   // setInterval(() => {
    this.b24()
  //  }, 6000)

  },
  methods: {
    async b24 () {
      const users = await BX24API.callMethod('user.get', { 'FILTER': { 'UF_DEPARTMENT': 5, 'ACTIVE': true } })
      let user = users.result;
      let monitor = []

      for(let i = 0; i < user.length; i++) {

        let callTime = 0;
        let dealCount = 0;

        const calls = await BX24API.getAll('voximplant.statistic.get',
            {'FILTER': { '>=CALL_DURATION': 30, 'CALL_TYPE': 1, 'PORTAL_USER_ID': user[i].ID, '>CALL_START_DATE': '2022-07-08'}})
        let call = calls.result

        for(let i = 0; i < call.length; i++) {
          callTime += parseInt(call[i].CALL_DURATION)
        }

        const deals = await BX24API.getAll('crm.deal.list',
            {'FILTER': { 'ASSIGNED_BY_ID': user[i].ID,'>DATE_CREATE': '2022-07-08'}})
        //let deal = deals.result



        console.log(calls)
        monitor.push({
          id: user[i].ID,
          name: user[i].NAME,
          last_name: user[i].LAST_NAME,
          photo: user[i].PERSONAL_PHOTO,
          callCount: calls.total,
          callTime: Math.floor(callTime/60),
          dealCount: deals.total
        })

      }

     // console.log(monitor)
      this.tableDatas = monitor

      this.isLoad = true
     // console.log(user)
    }

  }
}
</script>

<style scoped>
  .table-dark {
    color: #ffffff;
    font-weight: bolder;
    width: 100%;
  }
  .table-dark .font-width {
    font-size: 2vw;
  }
  .table-dark th, .table-dark td, .table-dark thead th {
    font-size: 20px;
    background-color: #000000;
  }
  .table-dark th {
    text-transform: uppercase;
  }
  .avatar {
    top: -31px;
    width: 110px ;
    height: 110px;
  }
  .avatar img {
    width: 110px ;
    height: 110px;
    border-radius: 50%;
  }
</style>
