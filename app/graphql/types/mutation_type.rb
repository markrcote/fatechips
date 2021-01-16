module Types
  class MutationType < Types::BaseObject
    field(:take_chip, mutation: Mutations::TakeChip)
    field(:return_chip, mutation: Mutations::ReturnChip)
    field(:register_user, mutation: Mutations::RegisterUser)
    field(:sign_in, mutation: Mutations::SignIn)
    field(:sign_out, mutation: Mutations::SignOut)
  end
end
