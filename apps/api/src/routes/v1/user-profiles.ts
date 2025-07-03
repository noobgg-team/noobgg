import { Hono } from 'hono'
import { 
    createUserProfile, 
    deleteUserProfile, 
    getUserProfile, 
    updateUserProfile 
} from '../../controllers/v1/user-profiles.controller'
import userFavoriteGamesRouter from './user-favorite-games'

const userProfiles = new Hono()

userProfiles.get('/:id', getUserProfile)
userProfiles.post('/', createUserProfile)
userProfiles.patch('/:id', updateUserProfile)
userProfiles.delete('/:id', deleteUserProfile)

// Mount nested favorite games routes
userProfiles.route('/:userId/favorite-games', userFavoriteGamesRouter)

export default userProfiles
