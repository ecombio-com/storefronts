import {StoryCard} from '~/components/home/story-card';
import {Slider, SliderContent, SliderFade, SliderHeader, SliderItem, SliderNav} from '~/components/ui/slider';
import type {CommunityStory} from '~/lib/home';

const NAV_CIRCLES =
  'gap-ds-small [&_button]:flex [&_button]:size-10 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-foreground [&_button]:text-background [&_button:disabled]:bg-muted [&_button:disabled]:text-muted-foreground';

export function VideoCarousel({title, items}: {title: string; items: CommunityStory[]}) {
  if (items.length === 0) return null;
  return (
    <Slider aria-label={title}>
      <SliderHeader>
        <h2 className="font-display tracking-tight text-ds-h2 font-semibold">{title}</h2>
        <SliderNav className={NAV_CIRCLES} />
      </SliderHeader>
      <div className="relative min-w-0">
        <SliderContent className="gap-ds-regular">
          {items.map((story, i) => (
            <SliderItem key={story.id ?? `${i}-${story.video}`} className="w-52 sm:w-64">
              <StoryCard story={story} />
            </SliderItem>
          ))}
        </SliderContent>
        <SliderFade side="left" />
        <SliderFade />
      </div>
    </Slider>
  );
}
