
const jsonEvent = [
    {
        title: 'All Day Event',
        description: 'Lorem ipsum 1...',
        start: '2022-05-18',
        color: '#3A87AD',
        textColor: '#ffffff',
    },
    {
        title: 'Prueba 1',
        description: 'Lorem ipsum 1...',
        start: '2022-05-19',
        color: '#3A87AD',
        textColor: '#ffffff',
    },
    {
        title: 'Prueba 2',
        description: 'Lorem ipsum 1...',
        start: '2022-05-20',
        color: '#3A87GD',
        textColor: '#ffffff',
    },
    {
        title: 'All Day Event',
        description: 'Lorem ipsum 1...',
        start: '2022-05-18',
        color: '#3A87AD',
        textColor: '#ffffff',
    }
];

var myModal = new bootstrap.Modal(document.getElementById('myModal'))

 document.addEventListener('DOMContentLoaded', function() {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar:{
            left: 'prev, next, today',
            center: 'title',
            right: 'dayGridMonth, timeGridWeek, listWeek',
        },
        events: jsonEvent,
        dateClick: function(info){ 
            console.log(info);
            document.getElementById('date').value = info.dateStr;
            document.getElementById('titulo').textContent = 'Registrar Evento';
            myModal.show();
        },
    }); 
    calendar.render();
});

