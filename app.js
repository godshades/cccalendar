function ccCalendar() {
  var cashbackOptions = [
    'Giải trí', 'Fitness', 'Spa', 'Mua sắm', 'Du lịch',
    'Grab', 'Xanh SM', 'Tiki', 'TikTok Shop', 'Shopee',
    'Lazada', 'Ăn uống', 'ShopeeFood', 'Siêu thị', 'Giáo dục',
    'Y tế', 'Bảo hiểm', 'Be', 'Phòng chờ', 'Khác'
  ];

  return {
    currentView: 'calendar',
     currentYear: new Date().getFullYear(),
     currentMonth: new Date().getMonth(),
     selectedCardIds: [],
     customCards: [],
     monthlyStatus: {},
     prebuiltCards: [],
     cardSearchQuery: '',
     selectedCardName: '',
     selectedCardDate: '',
     selectedCardNote: '',
     showDropdown: false,
     showCardBrowser: false,
     showExportModal: false,
     showImportModal: false,
     browserTab: 'prebuilt',
      customCard: {
        name: '',
        bank: '',
        paymentDueDate: null,
        cashbackCategories: [],
        maxCashback: 0,
        currentCashback: 0
      },
     cashbackOptions: cashbackOptions,
     exportResult: '',
     exportedString: '',
     importString: '',
     importResult: '',
     importSuccess: false,
     toast: {
       show: false,
       message: '',
       type: 'success'
     },
     matrixOrientation: 'cards-as-rows',
      allCardsData: [],
      allCategories: [],
      matrixNotes: {},
      editingNoteCardId: null,
      editingNoteText: '',
      showCategoryManager: false,
      selectedManagerCardId: null,
      managerCategorySearch: '',
      hiddenCategories: {},
      customCardName: '',
      isCustomCard: false,
      editingCardId: null,
      editingData: {},
      selectedMaxCashback: '',
      selectedCurrentCashback: '',

      initCategoryManager: function () {
        if (this.customCards.length > 0 && !this.selectedManagerCardId) {
          this.selectedManagerCardId = this.customCards[0].id;
        }
      },

      getFilteredCategories: function () {
        var self = this;
        var query = (this.managerCategorySearch || '').toLowerCase().trim();
        var list = this.getAllCategoriesList();
        var filtered = list;
        if (query) {
          filtered = list.filter(function (cat) {
            return cat.toLowerCase().indexOf(query) !== -1;
          });
        }
        var withRates = filtered.filter(function (cat) {
          return self.customCards.some(function (card) {
            return card.id === self.selectedManagerCardId && card.cashbackCategories && card.cashbackCategories.some(function (c) {
              return c.category === cat && c.rate;
            });
        });
      });
      var withoutRates = filtered.filter(function (cat) {
        return !withRates.includes(cat);
      });
      return withRates.concat(withoutRates);
    },
    editingRateCardId: null,
    editingRateCategory: '',
    editingRateValue: '',

    init: function () {
      var self = this;
      fetch('/data/cards_name.txt')
        .then(function (response) { return response.text(); })
        .then(function (text) {
          self.prebuiltCards = text.split('\n').map(function (line) {
            return line.trim();
          }).filter(function (name) {
            return name.length > 0;
          });
        })
        .catch(function (error) { console.error('Error loading card names:', error); });
      fetch('/data/cards.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
          self.allCardsData = data.cards || [];
          var categoriesMap = {};
          self.allCardsData.forEach(function (card) {
            if (card.cashbackCategories) {
              card.cashbackCategories.forEach(function (cat) {
                categoriesMap[cat.category] = true;
              });
            }
          });
          self.allCategories = Object.keys(categoriesMap);
        })
        .catch(function (error) { console.error('Error loading cards:', error); });
      this.loadFromLocalStorage();
      this.initSwipeGestures();
    },

    initSwipeGestures: function () {
      var startX = 0;
      var self = this;
      document.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      });
      document.addEventListener('touchend', function (e) {
        var diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            self.prevMonth();
          } else {
            self.nextMonth();
          }
        }
      });
      this.initModalSwipe();
    },

    initModalSwipe: function () {
      var self = this;
      var setupModalSwipe = function () {
        document.querySelectorAll('.fixed.inset-0.z-50').forEach(function (modal) {
          var startY = 0;
          var currentY = 0;
          var isDragging = false;
          var modalContent = modal.querySelector('.bg-white');
          if (!modalContent || modalContent.classList.contains('sm:max-w-md')) return;

          modal.addEventListener('touchstart', function (e) {
            if (e.target.closest('.overflow-y-auto')) return;
            startY = e.touches[0].clientY;
            isDragging = true;
          }, { passive: true });

          modal.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            currentY = e.touches[0].clientY - startY;
            if (currentY > 0 && modalContent) {
              modalContent.style.transform = 'translateY(' + currentY + 'px)';
              modalContent.style.transition = 'none';
            }
          }, { passive: true });

          modal.addEventListener('touchend', function () {
            if (!isDragging) return;
            isDragging = false;
            if (currentY > 100) {
              self.showCardBrowser = false;
              self.showExportModal = false;
              self.showImportModal = false;
            }
            if (modalContent) {
              modalContent.style.transform = '';
              modalContent.style.transition = '';
            }
            currentY = 0;
          });
        });
      };
      setTimeout(setupModalSwipe, 500);
    },

    monthLabel: function () {
      var monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ];
      return monthNames[this.currentMonth] + '/' + this.currentYear;
    },

    truncateCardName: function (name) {
      var screenWidth = window.innerWidth;
      var maxLength = 6;
      if (screenWidth >= 1024) maxLength = 12;
      else if (screenWidth >= 768) maxLength = 8;
      if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
      }
      return name;
    },

    daysInMonth: function () {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    },

    firstDayOffset: function () {
      var day = new Date(this.currentYear, this.currentMonth, 1).getDay();
      return day === 0 ? 6 : day - 1;
    },

    isToday: function (day) {
      var today = new Date();
      return day === today.getDate() &&
        this.currentMonth === today.getMonth() &&
        this.currentYear === today.getFullYear();
    },

    getCardsDueOnDay: function (day) {
      var self = this;
      return this.userCards.filter(function (card) {
        return card.paymentDueDate === day;
      }).map(function (card) {
        var maxReached = self.getMaxReachedStatus(card.id);
        return Object.assign({}, card, { maxReached: maxReached });
      });
    },

    get userCards() {
      var self = this;
      return this.customCards.map(function (card) {
        var maxReached = self.getMaxReachedStatus(card.id);
        return Object.assign({}, card, { maxReached: maxReached });
      });
    },

    isCardAdded: function (cardName) {
      return this.customCards.some(function (card) { return card.name === cardName; });
    },

    selectCardFromDropdown: function (cardName) {
      var self = this;
      if (cardName === 'Tùy chỉnh') {
        this.isCustomCard = true;
        this.selectedCardName = '';
        this.cardSearchQuery = '';
        setTimeout(function () {
          self.showDropdown = false;
        }, 100);
        return;
      }
      this.isCustomCard = false;
      this.selectedCardName = cardName;
      this.cardSearchQuery = cardName;

      var cardData = this.allCardsData.find(function (c) { return c.name === cardName; });
      if (cardData && cardData.cashbackCategories && cardData.cashbackCategories.length > 0) {
        var defaultMax = cardData.cashbackCategories[0].maxCashback;
        if (defaultMax && defaultMax !== 'unlimited' && defaultMax !== '∞') {
          this.selectedMaxCashback = this.formatNumberWithCommas(defaultMax);
        } else {
          this.selectedMaxCashback = '';
        }
      } else {
        this.selectedMaxCashback = '';
      }

      setTimeout(function () {
        self.showDropdown = false;
      }, 100);
    },

    onCardInput: function () {
      if (this.cardSearchQuery.length > 0 && this.filteredCards.length > 0) {
        this.showDropdown = true;
      }
    },

    selectFirstMatch: function () {
      if (this.filteredCards.length > 0) {
        this.selectCardFromDropdown(this.filteredCards[0]);
      }
    },

    get filteredCards() {
      var self = this;
      var query = this.cardSearchQuery.toLowerCase().trim();
      if (!query) return this.prebuiltCards;
      var baseResults = this.prebuiltCards.filter(function (name) {
        return name.toLowerCase().indexOf(query) !== -1;
      });
      if (query === 'tùy' || query.indexOf('tùy') !== -1 || query === 'custom' || query.indexOf('custom') !== -1) {
        return ['Tùy chỉnh'].concat(baseResults);
      }
      return baseResults;
    },

    addSelectedCard: function () {
      var cardNameToAdd = this.isCustomCard ? this.customCardName : this.selectedCardName;
      if (!cardNameToAdd || !cardNameToAdd.trim()) {
        if (this.isCustomCard) {
          this.showToast('Vui lòng nhập tên thẻ tùy chỉnh', 'error');
        }
        return;
      }
      if (!this.selectedCardDate || this.selectedCardDate < 1 || this.selectedCardDate > 31) {
        this.showToast('Vui lòng nhập ngày thanh toán (1-31)', 'error');
        return;
      }
      var randomChars = Math.random().toString(36).substring(2, 6);
      var uniqueId = 'card-' + Date.now() + '-' + randomChars;
      var self = this;
      var cardData = this.allCardsData.find(function (c) { return c.name === cardNameToAdd.trim(); });
      var categories = cardData && cardData.cashbackCategories ? cardData.cashbackCategories.map(function (cat) {
        return { category: cat.category, rate: cat.rate };
      }) : [];
      var newCard = {
        id: uniqueId,
        name: cardNameToAdd.trim(),
        bank: this.isCustomCard ? 'Tùy chỉnh' : '',
        paymentDueDate: parseInt(this.selectedCardDate, 10),
        note: this.selectedCardNote || '',
        cashbackCategories: categories,
        maxCashback: parseInt(this.parseNumberWithCommas(this.selectedMaxCashback), 10) || 0,
        currentCashback: parseInt(this.parseNumberWithCommas(this.selectedCurrentCashback), 10) || 0
      };
      this.customCards.push(newCard);
      this.saveToLocalStorage();
      this.showToast('Đã thêm thẻ ' + newCard.name, 'success');
      this.selectedCardName = '';
      this.selectedCardDate = '';
      this.selectedCardNote = '';
      this.selectedMaxCashback = '';
      this.selectedCurrentCashback = '';
      this.customCardName = '';
      this.isCustomCard = false;
      this.cardSearchQuery = '';
      this.showCardBrowser = false;
    },

    removeCard: function (cardId) {
      var cardIndex = this.customCards.findIndex(function (c) { return c.id === cardId; });
      if (cardIndex !== -1) {
        var card = this.customCards[cardIndex];
        this.customCards.splice(cardIndex, 1);
        var monthKey = this.getMonthKey();
        if (this.monthlyStatus[monthKey] && this.monthlyStatus[monthKey][cardId]) {
          delete this.monthlyStatus[monthKey][cardId];
        }
        this.saveToLocalStorage();
        this.showToast('Đã xóa thẻ ' + card.name, 'success');
      }
    },

    toggleMaxReached: function (cardId) {
      var monthKey = this.getMonthKey();
      if (!this.monthlyStatus[monthKey]) {
        this.monthlyStatus[monthKey] = {};
      }
      if (!this.monthlyStatus[monthKey][cardId]) {
        this.monthlyStatus[monthKey][cardId] = { maxCashbackReached: false };
      }
      this.monthlyStatus[monthKey][cardId].maxCashbackReached =
        !this.monthlyStatus[monthKey][cardId].maxCashbackReached;
      this.saveToLocalStorage();
      var statusText = this.monthlyStatus[monthKey][cardId].maxCashbackReached ?
        'Đã đánh dấu đạt max' : 'Đã bỏ đánh dấu';
      this.showToast(statusText, 'success');
    },

    getMaxReachedStatus: function (cardId) {
      var monthKey = this.getMonthKey();
      return this.monthlyStatus[monthKey] &&
        this.monthlyStatus[monthKey][cardId] &&
        this.monthlyStatus[monthKey][cardId].maxCashbackReached;
    },

    getMonthKey: function () {
      var month = this.currentMonth + 1;
      return this.currentYear + '-' + (month < 10 ? '0' + month : month);
    },

    addCustomCategory: function () {
      this.customCard.cashbackCategories.push({ category: '', rate: '' });
    },

    removeCustomCategory: function (index) {
      this.customCard.cashbackCategories.splice(index, 1);
    },

    saveCustomCard: function () {
      if (!this.customCard.name || !this.customCard.bank || !this.customCard.paymentDueDate) {
        this.showToast('Vui lòng điền đầy đủ thông tin thẻ', 'error');
        return;
      }
      if (this.customCard.cashbackCategories.length === 0) {
        this.showToast('Vui lòng thêm ít nhất một lĩnh vực hoàn tiền', 'error');
        return;
      }
      var randomChars = Math.random().toString(36).substring(2, 6);
      var uniqueId = 'custom-' + Date.now() + '-' + randomChars;
      var newCard = {
        id: uniqueId,
        name: this.customCard.name,
        bank: this.customCard.bank,
        paymentDueDate: parseInt(this.customCard.paymentDueDate, 10),
        cashbackCategories: this.customCard.cashbackCategories.map(function (cat) {
          return { category: cat.category, rate: cat.rate };
        }),
        maxCashback: parseInt(this.customCard.maxCashback) || 0,
        currentCashback: parseInt(this.customCard.currentCashback) || 0
      };
      this.customCards.push(newCard);
      this.saveToLocalStorage();
      this.customCard = {
        name: '',
        bank: '',
        paymentDueDate: null,
        cashbackCategories: [],
        maxCashback: 0,
        currentCashback: 0
      };
      this.showToast('Đã thêm thẻ ' + newCard.name, 'success');
      this.showCardBrowser = false;
    },

    prevMonth: function () {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },

    nextMonth: function () {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },

    exportData: function () {
      var data = {
        selectedCardIds: this.selectedCardIds,
        customCards: this.customCards,
        monthlyStatus: this.monthlyStatus
      };
      var jsonString = JSON.stringify(data);
      var compressed = LZString.compressToBase64(jsonString);
      var self = this;
      navigator.clipboard.writeText(compressed).then(function () {
        self.exportResult = 'Đã sao chép vào clipboard!';
        self.exportedString = compressed;
      }).catch(function (err) {
        self.exportResult = 'Lỗi khi sao chép: ' + err.message;
        self.exportedString = compressed;
      });
    },

    importData: function () {
      var self = this;
      if (!this.importString || this.importString.trim() === '') {
        this.importResult = 'Vui lòng dán chuỗi mã hóa';
        this.importSuccess = false;
        return;
      }
      try {
        var decompressed = LZString.decompressFromBase64(this.importString);
        if (!decompressed) {
          throw new Error('Không giải mã được dữ liệu');
        }
        var data = JSON.parse(decompressed);
        if (!data.selectedCardIds || !Array.isArray(data.selectedCardIds)) {
          throw new Error('Dữ liệu không hợp lệ: thiếu selectedCardIds');
        }
        if (!data.customCards || !Array.isArray(data.customCards)) {
          throw new Error('Dữ liệu không hợp lệ: thiếu customCards');
        }
        if (!data.monthlyStatus || typeof data.monthlyStatus !== 'object') {
          throw new Error('Dữ liệu không hợp lệ: thiếu monthlyStatus');
        }
        this.selectedCardIds = data.selectedCardIds;
        this.customCards = data.customCards;
        this.monthlyStatus = data.monthlyStatus;
        
        this.customCards.forEach(function(card) {
          if (card.maxCashback === undefined || card.maxCashback === null) {
            card.maxCashback = 0;
          }
          if (card.currentCashback === undefined || card.currentCashback === null) {
            card.currentCashback = 0;
          }
        });
        
        this.saveToLocalStorage();
        this.importResult = 'Khôi phục thành công!';
        this.importSuccess = true;
        this.importString = '';
      } catch (err) {
        this.importResult = 'Lỗi: ' + err.message;
        this.importSuccess = false;
      }
    },

    copyExportedString: function () {
      var self = this;
      navigator.clipboard.writeText(this.exportedString).then(function () {
        self.showToast('Đã sao chép!', 'success');
      }).catch(function (err) {
        self.showToast('Lỗi khi sao chép: ' + err.message, 'error');
      });
    },

    saveToLocalStorage: function () {
      var data = {
        selectedCardIds: this.selectedCardIds,
        customCards: this.customCards,
        monthlyStatus: this.monthlyStatus
      };
      localStorage.setItem('cccalendar_data', JSON.stringify(data));
    },

    loadFromLocalStorage: function () {
      var stored = localStorage.getItem('cccalendar_data');
      if (stored) {
        try {
          var data = JSON.parse(stored);
          this.selectedCardIds = data.selectedCardIds || [];
          this.customCards = data.customCards || [];
          
          this.customCards.forEach(function(card) {
            if (card.maxCashback === undefined || card.maxCashback === null) {
              card.maxCashback = 0;
            }
            if (card.currentCashback === undefined || card.currentCashback === null) {
              card.currentCashback = 0;
            }
          });
          this.monthlyStatus = data.monthlyStatus || {};
        } catch (e) {
          console.error('Error loading from localStorage:', e);
          this.selectedCardIds = [];
          this.customCards = [];
          this.monthlyStatus = {};
        }
      } else {
        this.selectedCardIds = [];
        this.customCards = [];
        this.monthlyStatus = {};
      }
      var notesStored = localStorage.getItem('cccalendar_matrix_notes');
      if (notesStored) {
        try {
          this.matrixNotes = JSON.parse(notesStored);
        } catch (e) {
          this.matrixNotes = {};
        }
      }
      var hiddenStored = localStorage.getItem('cccalendar_hidden_categories');
      if (hiddenStored) {
        try {
          this.hiddenCategories = JSON.parse(hiddenStored);
        } catch (e) {
          this.hiddenCategories = {};
        }
      }
    },

    showToast: function (message, type) {
      var self = this;
      this.toast.show = true;
      this.toast.message = message;
      this.toast.type = type || 'success';
      setTimeout(function () {
        self.toast.show = false;
      }, 3000);
    },

    toggleMatrixOrientation: function () {
      this.matrixOrientation = this.matrixOrientation === 'cards-as-rows' ? 'categories-as-rows' : 'cards-as-rows';
    },

    getMatrixRate: function (cardName, categoryName) {
      var userCard = this.customCards.find(function (c) { return c.name === cardName; });
      if (userCard && userCard.cashbackCategories) {
        var cat = userCard.cashbackCategories.find(function (c) { return c.category === categoryName; });
        if (cat && cat.rate) {
          var rateStr = cat.rate.toString();
          if (rateStr.indexOf('%') !== -1) {
            return rateStr.replace('%', '');
          }
          return rateStr;
        }
      }
      var cardData = this.allCardsData.find(function (c) { return c.name === cardName; });
      if (cardData && cardData.cashbackCategories) {
        var cat2 = cardData.cashbackCategories.find(function (c) { return c.category === categoryName; });
        if (cat2 && cat2.rate) {
          var rateStr2 = cat2.rate.toString();
          if (rateStr2.indexOf('%') !== -1) {
            return rateStr2.replace('%', '');
          }
          return rateStr2;
        }
      }
      return null;
    },

    getMatrixNote: function (cardId) {
      return this.matrixNotes[cardId] || '';
    },

    openNoteEditor: function (cardId) {
      this.editingNoteCardId = cardId;
      this.editingNoteText = this.matrixNotes[cardId] || '';
    },

    saveNote: function () {
      if (this.editingNoteCardId) {
        if (this.editingNoteText && this.editingNoteText.trim()) {
          this.matrixNotes[this.editingNoteCardId] = this.editingNoteText.trim();
        } else {
          delete this.matrixNotes[this.editingNoteCardId];
        }
        localStorage.setItem('cccalendar_matrix_notes', JSON.stringify(this.matrixNotes));
        this.showToast('Đã lưu ghi chú', 'success');
      }
      this.editingNoteCardId = null;
      this.editingNoteText = '';
    },

    deleteNote: function () {
      if (this.editingNoteCardId) {
        delete this.matrixNotes[this.editingNoteCardId];
        localStorage.setItem('cccalendar_matrix_notes', JSON.stringify(this.matrixNotes));
        this.showToast('Đã xóa ghi chú', 'success');
      }
      this.editingNoteCardId = null;
      this.editingNoteText = '';
    },

    closeNoteEditor: function () {
      this.editingNoteCardId = null;
      this.editingNoteText = '';
    },

    getAllCategories: function () {
      var self = this;
      var withRates = this.allCategories.filter(function (cat) {
        return !self.hiddenCategories[cat] && self.customCards.some(function (card) {
          return card.cashbackCategories && card.cashbackCategories.some(function (c) {
            return c.category === cat && c.rate;
          });
        });
      });
      return withRates.sort(function (a, b) {
        return a.localeCompare(b);
      });
    },

    getAllCategoriesList: function () {
      return this.allCategories.slice().sort(function (a, b) {
        return a.localeCompare(b);
      });
    },

    getRateForCategory: function (categoryName) {
      var card = this.customCards[0];
      if (card && card.cashbackCategories) {
        var cat = card.cashbackCategories.find(function (c) {
          return c.category === categoryName;
        });
        if (cat) return cat.rate;
      }
      return null;
    },

    getRateForCategoryByCard: function (cardId, categoryName) {
      var card = this.customCards.find(function (c) { return c.id === cardId; });
      if (card && card.cashbackCategories) {
        var cat = card.cashbackCategories.find(function (c) {
          return c.category === categoryName;
        });
        if (cat && cat.rate) {
          var rateStr = cat.rate.toString();
          if (rateStr.indexOf('%') !== -1) {
            return rateStr.replace('%', '');
          }
          return rateStr;
        }
      }
      return '';
    },

    addCategoryToCard: function (cardId, categoryName, rate) {
      var card = this.customCards.find(function (c) { return c.id === cardId; });
      if (card) {
        if (!card.cashbackCategories) card.cashbackCategories = [];
        var existing = card.cashbackCategories.find(function (c) { return c.category === categoryName; });
        if (rate && rate.trim()) {
          var parsedRate = parseFloat(rate.trim());
          if (existing) {
            existing.rate = parsedRate;
          } else {
            card.cashbackCategories.push({ category: categoryName, rate: parsedRate });
          }
        } else if (existing) {
          var idx = card.cashbackCategories.indexOf(existing);
          card.cashbackCategories.splice(idx, 1);
        }
        this.saveToLocalStorage();
      }
    },

    toggleCategoryVisibility: function (category) {
      this.hiddenCategories[category] = !this.hiddenCategories[category];
      localStorage.setItem('cccalendar_hidden_categories', JSON.stringify(this.hiddenCategories));
    },

    openRateEditor: function (cardId, category, currentRate) {
      this.editingRateCardId = cardId;
      this.editingRateCategory = category;
      this.editingRateValue = currentRate || '';
    },

    saveRate: function () {
      if (this.editingRateCardId && this.editingRateCategory) {
        var card = this.customCards.find(function (c) { return c.id === this.editingRateCardId; }.bind(this));
        if (card) {
          if (!card.cashbackCategories) card.cashbackCategories = [];
          var existingCat = card.cashbackCategories.find(function (c) { return c.category === this.editingRateCategory; }.bind(this));
          if (this.editingRateValue && this.editingRateValue.trim()) {
            var rate = parseFloat(this.editingRateValue.trim());
            if (existingCat) {
              existingCat.rate = rate;
            } else {
              card.cashbackCategories.push({ category: this.editingRateCategory, rate: rate });
            }
          } else {
            var idx = card.cashbackCategories.findIndex(function (c) { return c.category === this.editingRateCategory; }.bind(this));
            if (idx !== -1) card.cashbackCategories.splice(idx, 1);
          }
          this.saveToLocalStorage();
        }
      }
      this.closeRateEditor();
      this.showToast('Đã lưu tỷ lệ hoàn tiền', 'success');
    },

    deleteRate: function () {
      this.editingRateValue = '';
      this.saveRate();
    },

    closeRateEditor: function () {
      this.editingRateCardId = null;
      this.editingRateCategory = '';
      this.editingRateValue = '';
    },

    openEditModal: function (card) {
      this.editingCardId = card.id;
      this.editingData = {
        id: card.id,
        name: card.name,
        paymentDueDate: card.paymentDueDate,
        note: card.note,
        maxCashback: card.maxCashback,
        currentCashback: card.currentCashback,
        cashbackCategories: JSON.parse(JSON.stringify(card.cashbackCategories || []))
      };
    },

    saveEditedCard: function () {
      if (!this.editingData.name || !this.editingData.name.trim()) {
        this.showToast('Vui lòng nhập tên thẻ', 'error');
        return;
      }
      if (!this.editingData.paymentDueDate || this.editingData.paymentDueDate < 1 || this.editingData.paymentDueDate > 31) {
        this.showToast('Vui lòng nhập ngày thanh toán (1-31)', 'error');
        return;
      }

      var cardIndex = this.customCards.findIndex(function (c) { return c.id === this.editingCardId; }.bind(this));
      if (cardIndex !== -1) {
        this.customCards[cardIndex] = Object.assign({}, this.customCards[cardIndex], {
          name: this.editingData.name.trim(),
          paymentDueDate: parseInt(this.editingData.paymentDueDate, 10),
          note: this.editingData.note || '',
          maxCashback: parseInt(this.editingData.maxCashback, 10) || 0,
          currentCashback: parseInt(this.editingData.currentCashback, 10) || 0,
          cashbackCategories: this.editingData.cashbackCategories
        });
        this.saveToLocalStorage();
        this.showToast('Đã cập nhật thẻ ' + this.editingData.name, 'success');
        this.closeEditModal();
      }
    },

    deleteEditedCard: function () {
      if (confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
        this.removeCard(this.editingCardId);
        this.closeEditModal();
      }
    },

    closeEditModal: function () {
      this.editingCardId = null;
      this.editingData = {};
    },

    formatCashback: function (val) {
      if (val >= 1000000) {
        return (val / 1000000) + 'M';
      } else if (val >= 1000) {
        return (val / 1000) + 'K';
      }
      return val.toString();
    },

    formatNumberWithCommas: function (num) {
      if (!num) return '';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    parseNumberWithCommas: function (str) {
      if (!str) return '';
      return str.replace(/,/g, '');
    }
  };
}
