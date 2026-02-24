const ncertData = {
    bio: [
        { id: "CH-01", name: "The Living World", url: "https://ncert.nic.in/textbook/pdf/kebo101.pdf" },
        { id: "CH-08", name: "Cell: Unit of Life", url: "https://ncert.nic.in/textbook/pdf/kebo108.pdf" }
    ],
    phy: [
        { id: "CH-01", name: "Units and Measurements", url: "https://ncert.nic.in/textbook/pdf/keph101.pdf" }
    ]
};

window.renderNCERT = () => {
    const main = document.querySelector('main');
    main.innerHTML = `
        <button onclick="location.reload()" class="mb-4 text-xs font-bold text-slate-500"><i class="fas fa-arrow-left"></i> BACK</button>
        <h2 class="text-2xl font-black mb-6">NCERT Library 2026</h2>
        <div class="space-y-4">
            ${ncertData.bio.map(book => `
                <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                        <p class="text-[10px] text-yellow-500 font-black">${book.id}</p>
                        <h4 class="font-bold text-sm">${book.name}</h4>
                    </div>
                    <a href="${book.url}" target="_blank" class="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black">READ PDF</a>
                </div>
            `).join('')}
        </div>
    `;
};

