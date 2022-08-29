<template>
  <div id="app">
    <div v-if="isLoad === false" class="giphy-embed"><iframe src="https://giphy.com/embed/l0He4fJxPCbfqv7Xi" width="480" height="410" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>
    <table v-if="isLoad === true" class="table table-striped table-dark">
      <thead>
      <tr>
        <th scope="col">Менеджер</th>
        <th scope="col">Звонки</th>
        <th scope="col">Время</th>
        <th scope="col">Сум/сделок</th>
        <th scope="col">Сделка/Д</th>
        <th scope="col">Сделка/Н</th>
        <th scope="col">ЦКП/День</th>
        <th scope="col">ЦКП/Неделя</th>
      </tr>
      </thead>
      <tbody>
        <tr v-for="(tableData, index) in tableDatas" :key="tableDatas.id">
          <td  class="name-width align-middle">
            <div class="avatars avatar">
              <img :src="tableData.photo" alt="">
            </div>
            {{tableData.name}} <br> {{tableData.last_name}}
          </td>
          <td>
            <div id="chart" class="chart-count">
              <apexchart type="radialBar" height="250" width="190" :options="chartOptions" :series="[Math.trunc((tableData.callCount * 100) / callCount)]" />
            </div>
            Звонков: {{tableData.callCount}}
          </td>
          <td>
            <div id="chart2" class="chart-count">
              <apexchart type="radialBar" height="250" width="190" :options="chartOptions" :series="[Math.trunc((tableData.callTime * 100) / 100)]" />
            </div>
            Минут: {{tableData.callTime}}
          </td>
          <td  class="font-width align-middle">
            {{tableData.dealSum}}
          </td>
          <td  class="font-width align-middle">
            {{tableData.dealCount}}
          </td>
          <td  class="font-width align-middle">
            {{tableData.dealWeek}}
          </td>
          <td  class="font-width align-middle">
            {{tableData.dealPaySum}}
          </td>
          <td  class="font-width align-middle">
            {{tableData.dealPaySumWeek}}
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import BX24API from './bx24';
import VueApexCharts from 'vue-apexcharts';
import VueSpeedometer from 'vue-speedometer';

export default {
  name: 'App',
  components: {
    apexchart: VueApexCharts,
    VueSpeedometer
  },
  data () {
    return {
      isLoad: false,
      dateStart: this.$moment().subtract(1, 'weeks').isoWeekday(4).format('YYYY-MM-DD 00:00:00'),
      dateEnd: this.$moment().subtract(0, 'weeks').isoWeekday(3).format('YYYY-MM-DD 23:59:59'),
      presentDay: '  ',
      chartOptions: {
        chart: {
          offsetY: -20,
          foreColor: '#e7e7e7'
        },
        plotOptions: {
          bar: {
            dataLabels: {
              position: 'center', // top, center, bottom
            },
          },
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background:	'#e7e7e7',
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
              shadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#ffffff',
                opacity: 1,
                blur: 1
              }
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -2,
                fontSize: '22px'
              }
            }
          }
        },
        fill: {
          colors: [function ({value}) {
            if (value < 55) {
              return 'hsl(348, 100%, 61%)'
            } else if (value >= 55 && value < 99) {
              return 'hsl(48, 100%, 67%)'
            } else {
              return 'hsl(141, 53%, 53%)'
            }
          }],
          type: 'gradient',
          gradient: {
            shade: 'dark',
            shadeIntensity: 0.1,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 54, 90]
          }
        },
        labels: ['Average Results']
      },
      dateSartWeek: null,
      dateEndWeek: null,
      callDuration: 60, // Минимальное время звонка
      callCount: 35, // Количество звонков
      leads: [],
      tableDatas: []
    }
  },
  created() {
    setInterval(() => {
      this.b24()
    }, 26000)
  },
  methods: {
    async b24 () {
      const date = new Date();
      this.presentDay = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;
      console.log(this.presentDay)

      const users = await BX24API.callMethod('user.get', { 'FILTER': { 'UF_DEPARTMENT': 5, 'ACTIVE': true } })
      let user = users.result;

      for(let i = 0; i < user.length; i++) {
        if (parseInt(user[i].ID) === 6){continue}

        let callTime = 0;
        let dealSum = 0;
        let dealPaySum = 0;
        let dealPaySumWeek = 0;

        // Количество звонков
        const calls = await BX24API.getAll('voximplant.statistic.get',
            {'FILTER': { '>CALL_DURATION': this.callDuration, 'CALL_TYPE': 1, 'PORTAL_USER_ID': user[i].ID, '>CALL_START_DATE': this.presentDay+' 00:00:00'}})
        let call = calls.result

        for(let i = 0; i < call.length; i++) { callTime += parseInt(call[i].CALL_DURATION) }

        //Сумма сделок и колличество
        const deals = await BX24API.getAll('crm.deal.list',
            {'FILTER': { 'ASSIGNED_BY_ID': user[i].ID,'>DATE_CREATE': this.presentDay+' 00:00:00', '<DATE_CREATE': this.presentDay+' 23:59:59'}})
        let deal = deals.result

        for(let i = 0; i < deal.length; i++) { dealSum += parseInt(deal[i].OPPORTUNITY) }

        // Количество сделок за неделю
        const dealsWeek = await BX24API.getAll('crm.deal.list',
            {'FILTER': { 'ASSIGNED_BY_ID': user[i].ID,'>DATE_CREATE': this.dateStart,'<DATE_CREATE': this.dateEnd}})

        // ЦКП сделок день
        const dealsPay = await BX24API.getAll('crm.deal.list',
            {'FILTER': { 'ASSIGNED_BY_ID': user[i].ID, '>UF_CRM_60D305DF96F63': this.presentDay+' 00:00:00', '<UF_CRM_60D305DF96F63': this.presentDay+' 23:59:59'}})
        let dealPay = dealsPay.result

        for(let i = 0; i < dealPay.length; i++) { dealPaySum += parseInt(dealPay[i].OPPORTUNITY) }

        // ЦКП неделя
        const dealsPayWeek = await BX24API.getAll('crm.deal.list',
            {'FILTER': { 'ASSIGNED_BY_ID': user[i].ID, '>UF_CRM_60D305DF96F63': this.dateStart, '<UF_CRM_60D305DF96F63': this.dateEnd}})
        let dealPayW = dealsPayWeek.result

        for(let i = 0; i < dealPayW.length; i++) { dealPaySumWeek += parseInt(dealPayW[i].OPPORTUNITY) }

        this.tableDatas.push({
          id: user[i].ID,
          name: user[i].NAME,
          last_name: user[i].LAST_NAME,
          photo: user[i].PERSONAL_PHOTO,
          callCount: calls.total,
          callTime: Math.floor(callTime/this.callDuration),
          dealSum: dealSum,
          dealCount: deals.total,
          dealWeek: dealsWeek.total,
          dealPaySum: dealPaySum,
          dealPaySumWeek: dealPaySumWeek
        })
      }
      this.isLoad = true
    }
  }
}
</script>

<style scoped>
  .table-dark {
    border-collapse: collapse;
    color: #ffffff;
    font-weight: bolder;
    width: 100%;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  }
  .table-dark .font-width { font-size: 2vw; }
  .table-dark .name-width { font-size: 1.2vw; }
  .table-dark th, .table-dark td, .table-dark thead th {
    padding: 0 15px;
    font-size: 20px;
    background-color: #000000;
    text-align: center;
  }
  .table-dark th {
    text-transform: uppercase;
  }
  .avatar {
    width: 66px;
    float: left;
  }
  .avatar img {
    width: 66px;
    border-radius: 50%;
  }
  .chart-count { height: 100px; }
  .giphy-embed {
    width: 250px;
    height: 250px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -125px 0 0 -125px;
  }
</style>
