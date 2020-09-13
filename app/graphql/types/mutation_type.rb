module Types
  class MutationType < Types::BaseObject
    field(:take_chip, mutation: Mutations::TakeChip)
    field(:return_chip, mutation: Mutations::ReturnChip)
  end
end
