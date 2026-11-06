import {cn} from 'cn';
import {Form} from 'react-router';
import {buttonVariants} from '~/components/ui/button';

export function SignOutButton() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className={cn(buttonVariants({size: 'sm', variant: 'outline'}), 'w-full justify-center')}
      >
        Sign out
      </button>
    </Form>
  );
}