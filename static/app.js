class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            ticketButton: document.querySelector('.ticket__button'),
            voiceButton: document.querySelector('.chatbox__voice--footer')
        };
        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton, ticketButton, voiceButton } = this.args;
        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));
        ticketButton.addEventListener('click', () => this.raiseTicket());
        voiceButton.addEventListener('click', () => this.startVoiceRecognition());

        const node = chatBox.querySelector('input');
        node.addEventListener('keyup', ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    raiseTicket() {
        const ticketButton = document.querySelector('.ticket__button');
        if (!ticketButton.hasListenerAttached) {
            toastr.options.preventDuplicates = true;
            toastr.options.showMethod = 'fadeIn';
            toastr.options.hideMethod = 'fadeOut';
   
            ticketButton.addEventListener('click', () => {
                console.log('ticketButton:', ticketButton);
   
                // Generate and display the form
                const form = generateForm();
                document.body.appendChild(form);
   
                // Add event listener for form submission
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
   
                    const issueDescription = form.querySelector('textarea[name="issue"]').value;
                    const screenshotFile = form.querySelector('input[name="screenshot"]').files[0];
   
                    // Generate a ticket number
                    const ticketNumber = Math.floor(Math.random() * 1000);
   
                    // Customize the success message with the ticket number
                    const prefix = 'InfaUser';
                    const length = 7;
                    const randomString = generateRandomString(prefix, length);
                    const message = `Ticket ${ticketNumber} has been raised successfully by ${randomString}! Issue: ${issueDescription}`;
   
                    // Show the success message
                    toastr.clear();
                    toastr.success(message);
   
                    if (screenshotFile) {
                        // Read the screenshot file as base64
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            const base64Image = reader.result;
   
                            // Send email with issue description and attached screenshot
                            Email.send({
                                Host: "smtp.elasticemail.com",
                                Username: "shivamravi0705@gmail.com", // Replace with your username
                                Password: "5A6F0CAD1D4AB478C35CF127B4FA8287E3B2", // Replace with your password
                                To: 'shivamravi0705@gmail.com', // Replace with recipient email address
                                From: "shivamravi0705@gmail.com", // Replace with sender email address
                                Subject: "New Issue Ticket",
                                Body: issueDescription,
                                Attachments: [
                                    {
                                        name: 'screenshot.png',
                                        data: base64Image
                                    }
                                ]
                            }).then(
                                message => {
                                    toastr.success('Email sent successfully');
                                },
                                error => {
                                    toastr.error(`Failed to send email: ${error}`);
                                }
                            );
                        };
   
                        reader.readAsDataURL(screenshotFile);
                    } else {
                        // Send email without screenshot
                        Email.send({
                            Host: "smtp.elasticemail.com",
                            Username: "shivamravi0705@gmail.com", // Replace with your username
                            Password: "5A6F0CAD1D4AB478C35CF127B4FA8287E3B2", // Replace with your password
                            To: 'shivamravi0705@gmail.com', // Replace with recipient email address
                            From: "shivamravi0705@gmail.com", // Replace with sender email address
                            Subject: "New Issue Ticket",
                            Body: issueDescription
                        }).then(
                            message => {
                                toastr.success('Email sent successfully');
                            },
                            error => {
                                toastr.error(`Failed to send email: ${error}`);
                            }
                        );
                    }
   
                    // Remove the form after submission
                    form.remove();
                });
            });
   
            // Mark the button as having an event listener attached
            ticketButton.hasListenerAttached = true;
        }
   
        function generateRandomString(prefix, length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = prefix;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
   
        function generateForm() {
            const form = document.createElement('form');
            form.classList.add('form-container'); // Add CSS class
            form.innerHTML = `
                <h2>Raise a Support Ticket</h2>
                <input type="text" name="name" placeholder="Your Name">
                <input type="email" name="email" placeholder="Your Email">
                <input type="text" name="phone" placeholder="Your Phone Number">
                <textarea name="issue" placeholder="Describe your issue..."></textarea>
                <input type="file" name="screenshot" accept="image/*">
                <button type="submit">Submit</button>
            `;
            return form;
        }
    }

    toggleState(chatbox) {
        this.state = !this.state;
        // show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);
        this.speakText(msg1.message, 'User');
        this.updateChatText(chatbox);
        fetch($SCRIPT_ROOT + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                let responses = r.answers;
               
                this.displayTypingEffect(responses, chatbox);

                if (responses.includes("Record creation automation is being performed. Please enjoy the live demo...")) {
                    setTimeout(() => {
                        fetch($SCRIPT_ROOT + '/create_record', {
                            method: 'POST',
                            body: JSON.stringify({ intent: 'perform_create_record' }),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        })
                            .then(response => response.json())
                            .then(automationResult => {
                                let automationMsg = { name: "Chloe", message: automationResult.output };
                                this.messages.push(automationMsg);
                                this.speakText(automationMsg.message, 'Chloe');
                                this.updateChatText(chatbox);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                this.updateChatText(chatbox);
                            });
                    }, 1000);
                }

                textField.value = '';
            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox);
                textField.value = '';
            });
    }

    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Your browser doesn't support speech recognition. Please use Google Chrome.");
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.start();

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            const chatbox = this.args.chatBox;
            var textField = chatbox.querySelector('input');
            textField.value = speechResult;
            this.onSendButton(chatbox);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    speakText(text, speaker) {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'en-US';
            if (speaker === 'Chloe') {
                speech.voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google UK English Female');
            }
            window.speechSynthesis.speak(speech);
        } else {
            console.error("Your browser doesn't support speech synthesis.");
        }
    }

    displayTypingEffect(messages, chatbox) {
        const displayMessage = (message, index) => {
            if (index < messages.length) {
                const currentMessage = messages[index];
                let msg2 = { name: "Chloe", message: "" };
                this.messages.push(msg2);
                let charIndex = 0;
                const typeCharacter = () => {
                    if (charIndex < currentMessage.length) {
                        msg2.message += currentMessage.charAt(charIndex);
                        this.updateChatText(chatbox);
                        charIndex++;
                        setTimeout(typeCharacter, 50); // Adjust typing speed here
                    } else {
                        this.speakText(currentMessage, 'Chloe');
                        index++;
                        displayMessage(messages, index);
                    }
                };
                typeCharacter();
            }
        };
        displayMessage(messages, 0);
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item) {
            if (item.name === "Chloe") {
                html += '<ul class="messages__item messages__item--visitor">' + item.message + '</ul>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
        chatmessage.scrollTop = chatmessage.scrollHeight; // Auto-scroll to the bottom

    }
}

const chatbox = new Chatbox();
chatbox.display();
