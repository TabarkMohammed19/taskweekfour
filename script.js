document.addEventListener('DOMContentLoaded', function() {
    const itemNameInput = document.getElementById('itemName');
    const itemPriceInput = document.getElementById('itemPrice');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsList = document.getElementById('itemsList');
    const itemsCount = document.getElementById('itemsCount');
    const totalAmount = document.getElementById('totalAmount');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    let items = [];
    let editMode = false;
    let currentEditId = null;
    
    // Add item function
    addItemBtn.addEventListener('click', addItem);
    
    // Allow adding item with Enter key
    itemNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    
    itemPriceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    
    function addItem() {
        const name = itemNameInput.value.trim();
        const price = parseFloat(itemPriceInput.value);
        
        if (!name || isNaN(price) || price <= 0) {
            showNotification('Please enter valid item name and price', 'error');
            return;
        }
        
        // Check for duplicates
        if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
            showNotification('This item already exists in your list!', 'error');
            return;
        }
        
        const newItem = {
            id: Date.now(),
            name,
            price
        };
        
        items.push(newItem);
        updateItemsList();
        updateSummary();
        
        // Clear inputs
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemNameInput.focus();
        
        // Animation effect for new item
        const newItemElement = document.getElementById(newItem.id);
        if (newItemElement) {
            newItemElement.style.animation = 'none';
            setTimeout(() => {
                newItemElement.style.animation = 'itemAppear 0.5s ease-out';
            }, 10);
        }
        
        showNotification('Item added successfully!', 'success');
    }
    
    function updateItemsList() {
        itemsList.innerHTML = '';
        
        if (items.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your shopping list is empty</p>
                    <p>Add some items to get started</p>
                </div>
            `;
            return;
        }
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.id = item.id;
            li.className = 'item';
            
            // Determine price class based on value
            let priceClass = 'price-low';
            if (item.price >= 10 && item.price <= 50) {
                priceClass = 'price-medium';
            } else if (item.price > 50) {
                priceClass = 'price-high';
            }
            
            if (editMode && currentEditId === item.id) {
                li.innerHTML = `
                    <form class="edit-form">
                        <input type="text" class="edit-input" value="${item.name}" required>
                        <input type="number" class="edit-price" value="${item.price}" step="0.01" min="0" required>
                        <button type="submit" class="save-btn"><i class="fas fa-check"></i></button>
                        <button type="button" class="cancel-btn"><i class="fas fa-times"></i></button>
                    </form>
                `;
                
                const form = li.querySelector('.edit-form');
                const nameInput = li.querySelector('.edit-input');
                const priceInput = li.querySelector('.edit-price');
                const saveBtn = li.querySelector('.save-btn');
                const cancelBtn = li.querySelector('.cancel-btn');
                
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    saveEdit(item.id, nameInput.value.trim(), parseFloat(priceInput.value));
                });
                
                cancelBtn.addEventListener('click', function() {
                    cancelEdit();
                });
            } else {
                li.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <span class="item-price ${priceClass}">$${item.price.toFixed(2)}</span>
                    <div class="item-actions">
                        <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                const editBtn = li.querySelector('.edit-btn');
                const deleteBtn = li.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', function() {
                    startEdit(item.id);
                });
                
                deleteBtn.addEventListener('click', function() {
                    deleteItem(item.id);
                });
            }
            
            itemsList.appendChild(li);
        });
    }
    
    function startEdit(id) {
        editMode = true;
        currentEditId = id;
        updateItemsList();
    }
    
    function saveEdit(id, newName, newPrice) {
        if (!newName || isNaN(newPrice) || newPrice <= 0) {
            showNotification('Please enter valid item name and price', 'error');
            return;
        }
        
        // Check for duplicates (excluding current item)
        if (items.some(item => item.id !== id && item.name.toLowerCase() === newName.toLowerCase())) {
            showNotification('This item already exists in your list!', 'error');
            return;
        }
        
        items = items.map(item => 
            item.id === id ? { ...item, name: newName, price: newPrice } : item
        );
        
        editMode = false;
        currentEditId = null;
        updateItemsList();
        updateSummary();
        
        showNotification('Item updated successfully!', 'success');
    }
    
    function cancelEdit() {
        editMode = false;
        currentEditId = null;
        updateItemsList();
    }
    
    function deleteItem(id) {
        // Animation for deletion
        const itemElement = document.getElementById(id);
        if (itemElement) {
            itemElement.style.transform = 'translateX(100px)';
            itemElement.style.opacity = '0';
            
            setTimeout(() => {
                items = items.filter(item => item.id !== id);
                updateItemsList();
                updateSummary();
                showNotification('Item removed from your list', 'warning');
            }, 300);
        }
    }
    
    function updateSummary() {
        itemsCount.textContent = items.length;
        
        const total = items.reduce((sum, item) => sum + item.price, 0);
        totalAmount.textContent = total.toFixed(2);
        
        // Animation for total update
        totalAmount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            totalAmount.style.transform = 'scale(1)';
        }, 300);
    }
    
    function showNotification(message, type) {
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        
        // Add icon based on notification type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon} <span>${message}</span>`;
        notification.classList.remove('hidden');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
    
    // Initialize the list
    updateItemsList();
});
