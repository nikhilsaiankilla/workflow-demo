import { Plus, Send } from "lucide-react"
import { useContactStore } from "./store/useContactStore"
import { useEffect, useMemo, useState } from "react"

function App() {
  const {
    contacts,
    addContact,
    activeChatId,
    setActiveChatId,
    sendMessage,
    messages,
    isTyping,
    setIsTyping,
  } = useContactStore()

  const filteredMessages = useMemo(() => {
    return messages.filter(message => message.sentToId === activeChatId || message.userId === activeChatId)
  }, [messages, activeChatId])

  // states 
  const [message, setMessage] = useState<string>('')

  // seed contacts on load one
  useEffect(() => {
    const seedContacts = () => {
      for (let i = 0; i < 5; i++) {
        const contact = {
          name: `Contact ${i + 1}`,
          phone: `+91 123456789${i}`,
          avatar: `https://api.dicebear.com/10.x/lorelei/svg?seed=user-${i + 1}`,
          id: `${i + 1}`,
        }
        addContact(contact)
      }
    }
    seedContacts();
  }, [])

  //handle send message
  const handleSendMessage = () => {
    if (!message.trim() || !activeChatId) return;

    sendMessage({
      userId: 'string',
      sentToId: activeChatId,
      text: message,
      timestamp: Date.now(),
      read: false,
      sender: 'me',
      sent: true,
    })

    setMessage('');
    // triggering typing state to simulate a chat from other side
    setIsTyping(true);

    setTimeout(() => {// duplicating same message from other side to simulate a chat
      sendMessage({
        userId: 'string',
        sentToId: activeChatId,
        text: message,
        timestamp: Date.now(),
        read: false,
        sender: 'them',
        sent: true,
      })
    }, 1100)
  }
  return (
    <div className="w-full bg-stone-50 h-screen px-5 md:px-10 py-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-600">
          Tealsub
        </h1>
        <div className="flex items-center gap-3">
          <button className="bg-teal-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> New Contact
          </button>
        </div>
      </div>
      <div className="max-w-6xl h-[75vh] mx-auto mt-10 grid grid-cols-6 gap-3">
        <div className="col-span-2 bg-stone-200 rounded-lg p-5 overflow-y-scroll">
          <h1 className="text-lg font-bold text-teal-600">
            Contacts
          </h1>
          <li className="rounded-lg p-3 mt-5 list-none gap-4 flex flex-col">
            {
              contacts.map((contact, idx) => (
                <div className="flex items-center gap-5 cursor-pointer hover:bg-stone-300 px-2 py-1.5 rounded-md" key={idx} onClick={() => setActiveChatId(contact.id)}>
                  <img src={contact.avatar || `https://api.dicebear.com/10.x/lorelei/svg?seed=user-${contact.id}`}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full bg-stone-400"
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="font-normal text-xs">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                </div>
              ))
            }
          </li>
        </div>
        <div className="col-span-4 bg-stone-200 rounded-lg p-2 overflow-y-scroll">
          {
            activeChatId
              ?
              <div className="w-full h-full relative gap-2 flex flex-col">
                <div className="w-full flex items-center gap-5 bg-stone-300 rounded-lg py-2 px-5">
                  <div className="flex items-center gap-5">
                    <img
                      src={contacts.find(contact => contact.id === activeChatId)?.avatar || `https://api.dicebear.com/10.x/lorelei/svg?seed=user-${activeChatId}`}
                      alt={contacts.find(contact => contact.id === activeChatId)?.name}
                      className="w-10 h-10 rounded-full bg-stone-400"
                    />
                    <div>
                      <p className="font-normal text-xs">{contacts.find(contact => contact.id === activeChatId)?.name}</p>
                      <p className="text-sm text-gray-500">{contacts.find(contact => contact.id === activeChatId)?.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full flex-1 bg-stone-300 rounded-lg">
                  <div className={'flex-1'}>
                    {
                      filteredMessages.map((message, idx) => (
                        <div key={idx} className={`w-full flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} px-5 py-2`}>
                          <div className={`max-w-[60%] px-3 py-2 rounded-lg ${message.sender === 'me' ? 'bg-teal-600 text-white' : 'bg-stone-400 text-black'}`}>
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    }
                    {isTyping && (
                      <div className="w-full flex justify-start px-5 py-2">
                        <div className="max-w-[60%] px-3 py-2 rounded-lg bg-stone-400 text-black">
                          <p className="text-sm">Typing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <form className="w-full py-3 px-4 bg-stone-300 rounded-lg flex items-center gap-3 justify-between" onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="bg-transparent border-2 focus:outline-2 focus:outline-teal-600 border-stone-400 rounded-lg px-3 py-1.5 w-full"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-teal-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer" >
                    Send <Send />
                  </button>
                </form>
              </div>
              :
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-teal-500 text-sm">
                  Select a contact to start chatting
                </p>
              </div>
          }
        </div>
      </div>
    </div>
  )
}

export default App
