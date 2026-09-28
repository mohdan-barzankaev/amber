export const cafe = {
  name: 'Amber',
  whatsapp: '79280241313',
  phone: '+7 928 024-13-13',
  hours: '08:00–23:00',
  locations: [
    { id: 'esambaeva', address: 'Эсамбаева, 54', fullAddress: 'Грозный, улица Эсамбаева, 54' },
    { id: 'saykhanova', address: 'Сайханова, 53', fullAddress: 'Грозный, улица Сайханова, 53' },
  ],
};
export const mapLink = (address: string) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent('Amber Coffee, ' + address)}`;
