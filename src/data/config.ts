export const cafe = {
  name: 'Amber',
  whatsapp: '79280241313',
  phone: '+7 (928) 024-13-13',
  hours: '08:00–23:00',
  locations: [
    {
      id: 'esambaeva',
      address: 'бульвар М.А. Эсамбаева, 8',
      fullAddress: 'Грозный, бульвар М.А. Эсамбаева, 8',
    },
    {
      id: 'saykhanova',
      address: 'улица Сайханова, 266',
      fullAddress: 'Грозный, улица Сайханова, 266',
    },
  ],
};
export const mapLink = (address: string) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent('Amber Coffee, ' + address)}`;
