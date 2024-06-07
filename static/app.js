class Chatbox {
    constructor(){
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            ticketButton: document.querySelector('.ticket__button')
        }
        this.state = false;
        this.messages = [];
    }

    display(){
        const {openButton, chatBox, sendButton, ticketButton} = this.args;
        openButton.addEventListener('click', () => this.toggleState(chatBox))
        sendButton.addEventListener( 'click', () => this.onSendButton(chatBox))
        ticketButton.addEventListener('click', () => this.raiseTicket())

        const node = chatBox.querySelector('input');
        node.addEventListener( "keyup", ({key}) => {
            if (key === "Enter"){
                this.onSendButton(chatBox)
               }
        })
    }

    raiseTicket(){
        const ticketButton = document.querySelector('.ticket__button');
        toastr.options.preventDuplicates = true;
        toastr.options.showMethod = 'fadeIn';
        toastr.options.hideMethod = 'fadeOut';
        ticketButton.addEventListener('click', () => {
            console.log('ticketButton:', ticketButton);
        // Generate a ticket number
        const ticketNumber = Math.floor(Math.random() * 1000);
        // Customize the success message with the ticket number
        const prefix = 'InfaUser';
        const length = 7;
        const randomString = generateRandomString(prefix, length);
        const message = `Ticket ${ticketNumber} has been raised successfully by ${randomString}!`;
        toastr.options.preventDuplicates = true;
        // Show the success message
        toastr.clear();
        toastr.success(message);
        });

        function generateRandomString(prefix, length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = prefix;
            for (let i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
          }
    }

    toggleState(chatbox){
        this.state = !this.state;
        //show or hide the box
        if(this.state){
            chatbox.classList.add('chatbox--active')
        } else{
        chatbox.classList.remove( 'chatbox--active')
        }

    }

    onSendButton(chatbox){
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = {name: "User", message: text1}
        this.messages.push(msg1);

        fetch( $SCRIPT_ROOT + '/predict', {
        method: 'POST',
        body: JSON.stringify( { message: text1}),
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = {name: "Chloe", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''
        }).catch((error) => {
        console.error('Error:', error);
        this.updateChatText(chatbox)
        textField.value = ''
        });

        }

    updateChatText(chatbox) {
        var html ='';
        this.messages.slice().reverse().forEach(function(item){
        if(item.name === "Chloe")
        {
            let arr = item.message.reverse();

            for(let i = 0; i < arr.length; i++){

            html += '<ul class="messages__item messages__item--visitor">' +arr[i]+ '</ul>'
            }
        }
        else{
            html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
        }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
}

}

const chatbox = new Chatbox();
chatbox.display()