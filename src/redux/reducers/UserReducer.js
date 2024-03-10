import {UPDATE_USER_DETAILS} from '../actions/types';

const initialState = {
  transactionId: null,
  spinner: false,
  profileDetails: {},
  socket: null,
  darkMode: true,
  shipmentDetails: {
    usuario: 'Waxpla_T',
    clave: 'Rftyddq9b7',
    codigo_rte: '000803074', //SANDBOX VALUES
  },
  // shipmentDetails: {
  //   usuario: 'Waxpla_P',
  //   clave: 'IC3dLTFJx4',
  //   codigo_rte: '000803074',//PODUCTION VALUES
  // },
  cartLength: 0,
  bottomBarColor: false,
  isLoggedIn: false,
  initial: true,
  showCategories: false,
  showFriendProfile: {toggle: false, params: {}},
  showStoreDetails: {toggle: false, params: {}},
  selectedBottomPage: 'HOME',
  previousBottomPage: 'HOME',
  searchText: '',
  currentOrderDetails: {},
  purchaseDoneValues: {check: false},
  shipmentData: {},
  barcode: '',
  reRenderOrderDetails: 0,
  selectedAlbumDetails: null,
  selectedAlbumRelatedDetails: null,
  selectedAlbumId: '',
  isChatScreen: false,
  homeData: [
    [
      {type: 'banner', data: 'emptyLoader'},
      {type: 'banner', data: 'emptyLoader'},
    ],
    [
      {type: 'releases', data: 'emptyLoader'},
      {type: 'releases', data: 'emptyLoader'},
    ],
    [
      {type: 'releases', data: 'emptyLoader'},
      {type: 'releases', data: 'emptyLoader'},
    ],
  ],
  featuredData: [
    {data: 'emptyLoader'},
    {data: 'emptyLoader'},
    {data: 'emptyLoader'},
  ],
  categoryData: [
    [
      {type: 'banner', data: 'emptyLoader'},
      {type: 'banner', data: 'emptyLoader'},
    ],
    [
      {type: 'releases', data: 'emptyLoader'},
      {type: 'releases', data: 'emptyLoader'},
    ],
    [
      {type: 'releases', data: 'emptyLoader'},
      {type: 'releases', data: 'emptyLoader'},
    ],
  ],
  homeCategoriesData: [
    {data: 'emptyLoader', width: 100},
    {data: 'emptyLoader', width: 50},
    {data: 'emptyLoader', width: 100},
    {data: 'emptyLoader', width: 80},
    {data: 'emptyLoader', width: 100},
  ],
  firebasedb: null,
  // profileNavState: {
  //   stale: false,
  //   type: 'stack',
  //   key: 'stack-pVfY-YIw8pouNXG6EjfxG',
  //   index: 0,
  //   routeNames: [
  //     'Profilescreen',
  //     'Categoriesscreen',
  //     'Cartscreen',
  //     'PickUpForUser',
  //     'StoreDetails',
  //     'WeeklyDrops',
  //     'Collections',
  //     'Wishlist',
  //     'FriendProfile',
  //     'FriendsListing',
  //     'ProfileWeeklyDrops',
  //     'MySales',
  //     'Settings',
  //     'MyPurchases',
  //     'Terms',
  //     'Notifications',
  //     'DeleteAccount',
  //   ],
  //   routes: [
  //     {
  //       name: 'StoreDetails',
  //       params: {},
  //       key: 'StoreDetails-dI4sGFIdoJpDNQnZsJJfG',
  //     },
  //   ],
  // },
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER_DETAILS: {
      return {...state, [action.payload.prop]: action.payload.value};
    }
    default:
      return state;
  }
}
